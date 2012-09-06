module Shelby
  class API
    include HTTParty
    base_uri "#{Settings::ShelbyAPI.url}#{Settings::ShelbyAPI.version}"
  
    def self.get_user_info(nickname)
      u = get("/user/#{nickname}").parsed_response
      r = (u['status'] == 200) ? u['result'] : nil
    end
    
    def self.get_roll(id)
      r = get( "/roll/#{id}" ).parsed_response
    end
    
    def self.get_frame_info(frame_id, include_children=false)
      route = "/frame/#{frame_id}"
      route += "?include_children=true" if include_children
      f = get( route ).parsed_response
      return f['status'] == 200 ? f['result'] : nil
    end
    
    def self.get_video_info(frame_id)
      result = {}
      f = get( "/frame/#{frame_id}" ).parsed_response
      return nil if f['status'] != 200
      
      video_id = f['result']['video_id'] 
      v = get( "/video/#{video_id}" ).parsed_response
      return nil if v['status'] != 200
      v['result']["thumbnail_url"] ||= "#{Settings::Application..missing_thumb_url}"
      result = {'frame' => f['result'], 'video' => v['result']}
    end
    
    def self.get_first_frame_on_roll(roll_id)
      r = get( "/roll/#{roll_id}/frames?include_children=true&limit=1" ).parsed_response
      return nil if r['status'] != 200
      if r['result']['frames'] and r['result']['frames'].is_a?(Array)
        f0 = r['result']['frames'][0]
        f0['video']["thumbnail_url"] ||= "#{Settings::Application.missing_thumb_url}"
        {'frame' => f0, 'video' => f0['video'], 'roll' => r['result']}
      else
        {'frame' => nil, 'video' => nil, 'roll' => nil}
      end
    end
        
    def self.generate_frame_route(roll_id, frame_id)
      return "#{Settings::Application.url}/roll/#{roll_id}/frame/#{frame_id}"
    end

    def self.generate_user_route(user_id)
      return "#{Settings::Application.url}/user/#{user_id}/rolls/personal"
    end
    
    def self.generate_roll_route(roll_id)
      return "#{Settings::Application.url}/roll/#{roll_id}"
    end
    
    def self.post_to_genius(term, urls)
      r = post("/roll/genius", { :query => {'search' => term, 'urls' => urls}}).parsed_response
      return nil if r['status'] != 200
      r['result']
    end
    
    def self.get_frames_in_roll(roll_id)
      r = get( "/roll/#{roll_id}/frames?include_children=true" ).parsed_response
      return nil if r['status'] != 200
      if r['result']['frames'] and r['result']['frames'].is_a?(Array)
        roll = r['result']
      end
    end
  end
end
