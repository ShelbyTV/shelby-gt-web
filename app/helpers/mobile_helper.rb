module MobileHelper

  def can_play_video(provider_name)
    Settings::Mobile.supported_providers.include?(provider_name)
  end

  def set_timeline_preference(user, pref)
    # only do this if user has fb authed
    has_fb_authed =  user['authentications'].keep_if {|a| a['provider'] == "facebook"}
    return if has_fb_authed.empty?

    should_post = pref.nil? ? false : true
    # update user preference
    preferences = {:preferences => {:open_graph_posting => should_post} }
    update_user(user, preferences)
  end

  def follow_shelby(user, should_follow)
    # only do this if user has tw authed
    has_tw_authed =  user['authentications'].keep_if {|a| a['provider'] == "twitter"}
    return if has_tw_authed.empty?

    r = Shelby::API.follow_shelby_on_twitter(request.headers['HTTP_COOKIE'], csrf_token_from_cookie) if should_follow
    Shelby::CookieUtils.proxy_cookies(cookies, r.headers['set-cookie']) if r
  end

  def follow_rolls(rolls)
    rolls.keys.each do |id|
      r = Shelby::API.join_roll(id, request.headers['HTTP_COOKIE'], csrf_token_from_cookie)
      # proxy the cookies
      Shelby::CookieUtils.proxy_cookies(cookies, r.headers['set-cookie']) if r
    end
  end

  def update_user(user, attrs)
    r = Shelby::API.update_user(user['id'], attrs, Shelby::CookieUtils.generate_cookie_string(cookies), csrf_token_from_cookie)
    # proxy the cookies
    Shelby::CookieUtils.proxy_cookies(cookies, r.headers['set-cookie']) if r

    r
  end

  def dedupe_dashboard(dbes)
    return dbes unless dbes

    dbes.each_index do |i|
      if i > 0 and dbes[i]["frame"] and dbes[i - 1]["frame"] and (dbes[i]["frame"]["video"]["id"] == dbes[i - 1]["frame"]["video"]["id"])
        dbes[i]["duplicate"] = true
      end
    end
    return dbes
  end

  def dedupe_frames(frames)
    frames.each_index do |i|
      if (i > 0) and frames[i] and frames[i]["video"] and (frames[i]["video_id"] == frames[i - 1]["video_id"])
        frames[i]["duplicate"] = true
      end
    end
    return frames
  end

  def log_session
    EM.next_tick {
      r = Shelby::API.log_session(current_user_id, request.headers['HTTP_COOKIE'], csrf_token_from_cookie)
      Shelby::CookieUtils.proxy_cookies(cookies, r.headers['set-cookie']) if r
    }
  end

  def strip_protocol_from_url(url)
    if url.include? "http://"
      stripped_url = url.sub(/http\:/, '')
    elsif url.include? "https://"
      stripped_url = url.sub(/https\:/, '')
    end
    return stripped_url
  end

  def display_banners(user=nil)
    # if user var is nil for some reason, handle it.
    # hacky usertype for stupid user_signed_in // check_for_signed_in_user
    if ( (user.nil?) || (user['user_type'] == Settings::User.user_type.ghost) )
      {
        :anchor   => 'stream',
        :facebook => false,
        :sources  => true
      }

    #if anon AND you haven't connectedFB AND followedSources
  elsif ((user['user_type'] == Settings::User.user_type.anonymous) && user['app_progress'] && (user['app_progress']['connectedFacebook'].nil? && user['app_progress']['followedSources'].nil?))
      #show everything
      {
        :anchor   => nil,
        :facebook => true,
        :sources  => true
      }

    elsif (user['user_type'] == Settings::User.user_type.anonymous) && user['app_progress'] && ((user['app_progress']['connectedFacebook'] == "true") && user['app_progress']['followedSources'].nil?)
      #prevent FB from rendering, show sources
      {
        :anchor   => nil,
        :facebook => false,
        :sources  => true
      }

    elsif (user['user_type'] == Settings::User.user_type.anonymous) && user['app_progress'] && (user['app_progress']['connectedFacebook'].nil? && (user['app_progress']['followedSources'] == "true"))
      #scroll to FB
      {
        :anchor   => Settings::Mobile.inline_cta.social.id,
        :facebook => true,
        :sources  => true
      }
    elsif ((user['user_type'] == Settings::User.user_type.converted) && user['app_progress'] && (user['session_count'] <= Settings::User.anon_banner_session_count) && (user['app_progress']['connectedFacebook'].nil?))
      #scroll to First Frame
      {
        :anchor   => Settings::Mobile.inline_cta.social.id,
        :facebook => true,
        :sources  => true
      }
    elsif ((user['user_type'] == Settings::User.user_type.converted) && user['app_progress'] && (user['session_count'] > Settings::User.anon_banner_session_count) && (user['app_progress']['connectedFacebook'].nil?))
      #scroll to First Frame
      {
        :anchor   => 'stream',
        :facebook => false,
        :sources  => true
      }
    else
      #prevent FB from rendering
      #scroll to First Frame
      {
        :anchor   => 'stream',
        :facebook => false,
        :sources  => true
      }
    end
  end

  def is_frame_like?(frame)
    frame['frame_type'] == Settings::Frame.frame_type.light_weight
  end
end
