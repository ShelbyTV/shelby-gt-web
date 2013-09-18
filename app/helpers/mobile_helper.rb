module MobileHelper

  def can_play_video(provider_name)
    Settings::Mobile.supported_providers.include?(provider_name)
  end

  def follow_rolls(rolls)
    EM.next_tick do
      rolls.keys.each do |id|
        r = Shelby::API.join_roll(id, request.headers['HTTP_COOKIE'], csrf_token_from_cookie)
        # proxy the cookies
        Shelby::CookieUtils.proxy_cookies(cookies, r.headers['set-cookie']) if r
      end
    end
  end

  def update_user(user, attrs)
    r = Shelby::API.update_user(user['id'], attrs, Shelby::CookieUtils.generate_cookie_string(cookies), csrf_token_from_cookie)
    # proxy the cookies
    Shelby::CookieUtils.proxy_cookies(cookies, r.headers['set-cookie']) if r
  end

  def dedupe_dashboard(dbes)
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

end
