module ApplicationHelper

  #valid avatar_size options are "sq192x192", "sq48x48", and "original"
  def avatar_url_for_user(user, avatar_size="sq48x48")

    return "/images/assets/avatar.png" unless user

    if user['has_shelby_avatar']
      return "#{Settings::Application.avatar_url_root}/#{avatar_size}/#{user['id']}"
    else
      avatar_url = user['user_image_original'] || user['user_image']
      avatar_url = "/images/assets/avatar.png" if (!avatar_url || (avatar_url == 'null'))
      return avatar_url
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
    if page = page.to_i.abs + 1
      return page * Settings::Mobile.default_limit
    else
      return 1
    end
  end

  def check_for_signed_in_user
    if user_signed_in?
      signed_in_user = Shelby::API.get_user(current_user_id,request.headers['HTTP_COOKIE'])
    else
      signed_in_user = {}
      signed_in_user['nickname'] = 'Anonymous'
    end

    return signed_in_user
  end
end
