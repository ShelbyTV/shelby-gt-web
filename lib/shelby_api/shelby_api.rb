module Shelby
  class API
    include HTTParty
    base_uri "#{Settings::ShelbyAPI.url}#{Settings::ShelbyAPI.version}"

    def self.get_user(nickname_or_id)
      u = get("/user/#{nickname_or_id}").parsed_response
      return u['status'] == 200 ? u['result'] : nil
    end

    def self.get_user_stats(id, cookie)
      s = get("/user/#{id}/stats?num_frames=4", :headers => {'Cookie' => cookie}).parsed_response
      return s['status'] == 200 ? s['result'] : nil
    end

    def self.get_roll(id)
      r = get( "/roll/#{id}" ).parsed_response
      return r['status'] == 200 ? r['result'] : nil
    end

    def self.get_roll_by_subdomain(subdomain)
      r = get( "/roll" , :body => { :subdomain => subdomain }).parsed_response
      return r['status'] == 200 ? r['result'][0] : nil
    end

    def self.get_roll_with_frames(roll_id)
      r = get( "/roll/#{roll_id}/frames?include_children=true" ).parsed_response
      return nil if r['status'] != 200
      if r['result']['frames'] and r['result']['frames'].is_a?(Array)
        roll = r['result']
      end
    end

    def self.get_frame(frame_id, include_children=false)
      route = "/frame/#{frame_id}"
      route += "?include_children=true" if include_children
      f = get(route).parsed_response
      return f['status'] == 200 ? f['result'] : nil
    end

    def self.get_video(video_id)
      v = get( "/video/#{video_id}" ).parsed_response
      return nil if v['status'] != 200
      return v['result']
    end

    def self.get_first_frame_on_roll(roll_id)
      r = get( "/roll/#{roll_id}/frames?include_children=true&limit=1" ).parsed_response
      if r['status'] == 200 and r['result']['frames'] and r['result']['frames'].is_a?(Array)
        return r['result']['frames'][0]
      else
        return nil
      end
    end

    def self.generate_frame_route(roll_id, frame_id, protocol="http")
      return "#{protocol}://#{Settings::Application.domain}/roll/#{roll_id}/frame/#{frame_id}"
    end

    def self.generate_user_route(user_id)
      return "#{Settings::Application.url}/user/#{user_id}/rolls/personal"
    end

    def self.generate_roll_route(roll_id)
      return "#{Settings::Application.url}/roll/#{roll_id}"
    end

    def self.generate_video_route(video_provider_name, video_provider_id, protocol="http")
      return "#{protocol}://#{Settings::Application.domain}/video/#{video_provider_name}/#{video_provider_id}"
    end

    #UNUSED
    def self.post_to_genius(term, urls)
      r = post("/roll/genius", { :query => {'search' => term, 'urls' => urls}}).parsed_response
      return nil if r['status'] != 200
      r['result']
    end

  end
end
