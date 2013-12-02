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
      if i > 0 and dbes[i]["frame"]["video"]["id"] == dbes[i - 1]["frame"]["video"]["id"]
        dbes[i]["duplicate"] = true
      end
    end
    return dbes
  end

  def dedupe_frames(frames)
    frames.each_index do |i|
      if i > 0 and frames[i]["video"]["id"] == frames[i - 1]["video"]["id"]
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

end
