require 'addressable/uri'

module Shelby
  class API
    include HTTParty
    base_uri "#{Settings::ShelbyAPI.url}#{Settings::ShelbyAPI.version}"

    def self.create_user(attributes, cookie, token)
      headers = { 'Cookie' => cookie }
      headers['X-CSRF-Token'] = token if token
      post("#{Settings::ShelbyAPI.secure_url}#{Settings::ShelbyAPI.version}/user", { :body => attributes, :headers => headers })
    end

    def self.follow_shelby_on_twitter(cookie, token)
      headers = { 'Cookie' => cookie }
      headers['X-CSRF-Token'] = token if token
      post('/twitter/follow/shelby', {:headers => {'Cookie' => cookie, 'X-CSRF-Token' => token} })
    end

    def self.get_featured_sources(segment="onboarding")
      r = get( "/roll/featured?segment=#{segment}" ).parsed_response
      if r['status'] == 200 and r['result'].first['rolls'].is_a?(Array)
        return r['result'].first['rolls']
      else
        return nil
      end
    end

    def self.get_first_frame_on_roll(roll_id)
      r = get( "/roll/#{roll_id}/frames?include_children=true&limit=1" ).parsed_response
      if r['status'] == 200 and r['result']['frames'] and r['result']['frames'].is_a?(Array)
        return r['result']['frames'][0]
      else
        return nil
      end
    end

    def self.get_frame(frame_id, include_children=false)
      route = "/frame/#{frame_id}"
      route += "?include_children=true" if include_children
      f = get(route).parsed_response
      return f['status'] == 200 ? f['result'] : nil
    end

    def self.get_current_user(cookie)
      u = get("/user", :headers => {'Cookie' => cookie}).parsed_response
      return u['status'] == 200 ? u['result'] : nil
    end

    def self.get_roll(id)
      r = get( "/roll/#{id}" ).parsed_response
      return r['status'] == 200 ? r['result'] : nil
    end

    def self.get_roll_by_subdomain(subdomain)
      r = get( "/roll" , :body => { :subdomain => subdomain }).parsed_response
      return r['status'] == 200 ? r['result'][0] : nil
    end

    def self.get_roll_with_frames(roll_id, cookie, skip=0, limit=20)
      r = get( "/roll/#{roll_id}/frames?include_children=true&skip=#{skip}&limit=#{limit}", :headers => {'Cookie' => cookie}  ).parsed_response
      return nil if r['status'] != 200
      if r['result']['frames'] and r['result']['frames'].is_a?(Array)
        r['result']
      end
    end

    def self.get_user(nickname_or_id, cookie=nil)
      uri = Addressable::URI.parse("/user/#{nickname_or_id}" ).normalize.to_s
      headers = cookie ? {'Cookie' => cookie} : {}
      u = get(uri, :headers => headers).parsed_response
      return u['status'] == 200 ? u['result'] : nil
    end

    def self.get_user_dashboard(user_id, cookie, skip=0, limit=20, since_id=nil)
      base = user_id ? "/user/#{user_id}/dashboard" : '/dashboard'
      url = "#{base}?skip=#{skip}&limit=#{limit}"
      url += "&since_id=" + since_id if since_id
      r = get( url, :headers => {'Cookie' => cookie} ).parsed_response
      return nil if r['status'] != 200
      r['result']
    end

    def self.get_user_followings(user_id, cookie)
      r = get( "/user/#{user_id}/rolls/following", :headers => {'Cookie' => cookie} ).parsed_response
      return r['status'] == 200 ? r['result'] : nil
    end

    def self.get_user_stats(id, cookie)
      s = get("/user/#{id}/stats?num_frames=3", :headers => {'Cookie' => cookie}).parsed_response
      return s['status'] == 200 ? s['result'] : nil
    end

    def self.get_video(video_id)
      v = get( "/video/#{video_id}" ).parsed_response
      return nil if v['status'] != 200
      return v['result']
    end

    def self.find_or_create_video(video_provider_name, video_provider_id)
      v = get( "/video/find_or_create?provider_name=#{video_provider_name}&provider_id=#{video_provider_id}" ).parsed_response
      return nil if v['status'] != 200
      return v['result']
    end

    def self.join_roll(roll_id, cookie, token)
      headers = { 'Cookie' => cookie }
      headers['X-CSRF-Token'] = token if token
      post("/roll/#{roll_id}/join", { :headers => {'Cookie' => cookie, 'X-CSRF-Token' => token} })
    end

    def self.update_user(id, attributes, cookie, token)
      headers = { 'Cookie' => cookie }
      headers['X-CSRF-Token'] = token if token
      put("#{Settings::ShelbyAPI.secure_url}#{Settings::ShelbyAPI.version}/user/#{id}", { :body => attributes, :headers => headers })
    end

    def self.log_session(id, cookie, csrf_token)
      #return unless user_signed_in?
      headers = { 'Cookie' => cookie }
      headers['X-CSRF-Token'] = csrf_token if csrf_token
      put("#{Settings::ShelbyAPI.secure_url}#{Settings::ShelbyAPI.version}/user/#{id}/visit", { :headers => headers })
    end


    # def self.generate_frame_route(roll_id, frame_id, protocol="http")
    def self.generate_frame_route(user_nickname, frame_id, protocol="http")
      return "#{protocol}://#{Settings::Application.domain}/#{user_nickname}/shares/#{frame_id}"
    end

    def self.generate_user_route(user_id)
      return "#{Settings::Application.url}/#{user_id}"
    end

    def self.generate_roll_route(roll_id)
      return "#{Settings::Application.url}/roll/#{roll_id}"
    end

    def self.generate_video_route(video_provider_name, video_provider_id, protocol="http")
      return "#{protocol}://#{Settings::Application.domain}/video/#{video_provider_name}/#{video_provider_id}"
    end

  def self.user_signed_in?
    id = current_user_id
    id ? id != "nil" : false
  end

  def self.current_user_id
    cookie_to_hash(cookies[:_shelby_gt_common])[:authenticated_user_id]
  end

  def self.cookie_to_hash(c, delim=",", split="=")
    entries = c.blank? ? nil : c.split(delim)
    h = {}
    return h if entries.blank?

    entries.each do |entry|
      key, val = entry.split("=", 2)
      h[key.to_sym] = val
    end

    h
  end

    #UNUSED
    def self.post_to_genius(term, urls)
      r = post("/roll/genius", { :query => {'search' => term, 'urls' => urls}}).parsed_response
      return nil if r['status'] != 200
      r['result']
    end

  end
end
