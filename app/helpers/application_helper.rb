module ApplicationHelper
  def yield_content!(content_key)
    #USED IN LAYOUT: /home/shelf/_shelf.html.erb
    #fixes this stupid issue where yield(:foo) doesn't work

    view_flow.content.delete(content_key)
  end

  def format_content_for_layout(file)
    #USED IN LAYOUT: /home/shelf/_shelf.html.erb

    #remove extension
    @key = File.basename file, ".html.erb"

    #remove _ prefix
    @key[0] = ''

    # id, name, wrapper_modifier are labeled accordingly:
    # div id=":key" name=":name" class="shelf__wrapper shelf__wrapper--:wrapper_modifier"
    content_for :id, @key
    content_for :name, @key
    content_for :wrapper_modifier, @key

    # block_modifier and js_handler are labeled accordingly:
    # div class="shelf shelf--:block_modifier clearfix shelf--facebook-logged-out js-:js_handler"
    content_for :block_modifier, @key
    content_for :js_handler, @key
  end

  #valid avatar_size options are "sq192x192", "sq48x48", and "original"
  def avatar_url_for_user(user, avatar_size="#{Settings::Avatar.small}")

    return Settings::Avatar.missing unless user

    if user['has_shelby_avatar']
      return "#{Settings::Application.avatar_url_root}/#{avatar_size}/#{user['id']}"
    else
      avatar_url = user['user_image_original'] || user['user_image']
      avatar_url = "/images/assets/avatar.png" if (!avatar_url || (avatar_url == 'null'))
      return avatar_url
    end
  end

  def avatar_url_for_roll(roll, avatar_size="#{Settings::Avatar.small}")

    if roll && roll['creator_has_shelby_avatar']
      date = DateTime.parse(roll['creator_avatar_updated_at'])
      "#{Settings::Application.avatar_url_root}/#{avatar_size}/#{roll['creator_id']}?#{date.to_i}"
    elsif roll['creator_image_original']
      roll['creator_image_original']
    elsif roll['creator_image']
      roll['creator_image']
    elsif roll && roll['thumbnail_url']
      roll['thumbnail_url']
    else
      Settings::Avatar.missing
    end
  end

  def creators_message_from_frame(frame)
    if frame and frame['conversation'] and frame['conversation']['messages']
      messages = frame['conversation']['messages']
      messages_from_creator = messages.select { |m| m['user_id'] == frame['creator_id'] }
      return messages_from_creator.first['text'] unless messages_from_creator.empty?
    end
    return nil
  end

  def shelby_tracking_category_for(share_type)
    case share_type
    when :genius then "Genius Email Share Landing Page"
    when :email then "Direct Email Share Landing Page"
    when :rolling then "Rolling Share Landing Page"
    else "Landing Page"
    end
  end

  def page_title_for_roll(roll, user=nil)
    "#{user ? "Videos shared by #{user['name']} (#{user['nickname']})" : roll['title']} on Shelby.tv"
  end

  def page_description_for_roll_with_frames(roll_with_frames, user=nil)
    desc = user ? "Most recent video shared: " : ""
    if roll_with_frames['frames'] and roll_with_frames['frames'][0]
      msg = roll_with_frames['frames'][0]['conversation']['messages'][0]
      if msg and msg['user_id'] == roll_with_frames['creator_id']
        desc += roll_with_frames['frames'][0]['conversation']['messages'][0]['text'] || ''
      end
    end

    return desc.blank? ? nil : desc
  end

  def build_valid_video_player_url(video_embed)
    return '' unless video_embed

    urls = URI.extract(video_embed)
    if !urls.empty?
      return urls.first.include?('https') ? urls.first : urls.first.gsub(/http/,'https')
    else
      return ''
    end
  end

  def convert_page_to_skip(page)
    if page = page.to_i.abs
      return page * Settings::Mobile.default_limit
    else
      return 0
    end
  end

  def check_for_signed_in_user
    if user_signed_in?
      signed_in_user = Shelby::API.get_user(current_user_id,request.headers['HTTP_COOKIE'])
      if signed_in_user and signed_in_user['user_type'] and (signed_in_user['user_type'] == Settings::User.user_type.anonymous)
        signed_in_user['nickname'] = Settings::User.anonymous_user_nickname
        signed_in_user['name'] = ""
        signed_in_user['thumbnail_url'] = 'http://shelby.tv/assets/images/henry.jpg'
      end
    end

    unless signed_in_user
      signed_in_user = {}
      signed_in_user['nickname'] = Settings::User.anonymous_user_nickname
      signed_in_user['user_type'] = Settings::User.user_type.ghost
    end

    return signed_in_user
  end

  def build_frame_message(frame, dbe=nil)
    if dbe and dbe['action'] == 31 # video graph
      if dbe['src_frame'] and dbe['src_frame']['creator']
        verb = (dbe['src_frame']['frame_type'] == 1 ? 'liked' : 'shared')
        message = "This video is similar to videos "+ dbe['src_frame']['creator']['nickname'] +" has #{verb}"
      end
    elsif dbe and dbe['action'] == 33 # mortar
      message = "Because you liked "+ dbe['src_video']['title'] if dbe['src_video'] and dbe['src_video']['title']
    elsif frame['conversation'] and frame['conversation']['messages'] and frame['conversation']['messages'][0]
      message = frame['conversation']['messages'][0]['text']
    elsif frame['frame_type'] == 1
      message = ''
    else
      message = "This video is similar to videos you have watched, liked and shared."
    end
    return message
  end

  def build_avatar_and_nickname(dbe=nil, frame_owner=nil)
    if dbe and [0,1,2,3,8,9].include? dbe['action']
      avatar = avatar_url_for_user(frame_owner)
      displayName = linkableNickname = frame_owner['nickname']
    elsif dbe and [31,33].include? dbe['action']
      displayName = "Recommended for you"
      linkableNickname = nil
      avatar = 'http://shelby.tv/images/recommendations/share-2.jpg'
    elsif dbe and dbe['action'] == 34
      avatar = avatar_url_for_user(frame_owner)
      displayName = "FEATURED: "+frame_owner['nickname']
      linkableNickname = frame_owner['nickname']
    else
      avatar = avatar_url_for_user(frame_owner)
      linkableNickname = displayName = frame_owner['nickname'] if frame_owner
    end
    return avatar, linkableNickname, displayName
  end

  def build_frame_permalink(frame)
    if frame['creator']
      "http://shelby.tv/"+frame['creator']['nickname']+"/shares/"+frame['id']
    else
      "http://shelby.tv/video/"+frame['video']['provider_name']+'/'+frame['video']['provider_id'];
    end
  end

  # Mobile detection
  def is_mobile?
    request.env["HTTP_USER_AGENT"] && request.env["HTTP_USER_AGENT"][/(iPhone|iPod|Android|Kindle|Silk)/]
  end

  def detect_mobile_os
    return :windows if (request.user_agent=~/MSAppHost/)
    return :ios if (request.user_agent=~/iPhone/)
    return :amazon if (session[:amazon])
    return :amazon if (request.user_agent=~/AmazonWebAppPlatform/)
    return :android if (request.user_agent=~/Android/)
    return :tablet if (request.user_agent=~/Silk/)
    return :generic if is_mobile?
    return nil
  end

  def appropriate_subdirectory
    if detect_mobile_os == :amazon
      Settings::Mobile.amazon_subdirectory
    elsif is_mobile?
      Settings::Mobile.mobile_subdirectory
    else
      '' # empty string
    end
  end

end
