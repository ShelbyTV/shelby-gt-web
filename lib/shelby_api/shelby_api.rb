module Shelby
  class API
    include HTTParty
    base_uri 'api.gt.shelby.tv/v1'
  
    def self.get_roll(id)
      r = get( "/roll/#{id}" ).parsed_response
    end

    def self.get_video_info(frame_id)
      result = {}
      f = get( "/frame/#{frame_id}" ).parsed_response
      return nil if f['status'] != 200
      
      video_id = f['result']['video_id'] 
      v = get( "/video/#{video_id}" ).parsed_response
      return nil if v['status'] != 200
      
      result = {:frame => f['result'], :video => v['result']}
    end
    
    def self.generate_route(roll_id, frame_id)
      return "#{Settings::Application.url}/roll/#{roll_id}/frame/#{frame_id}"
    end
  
  end
end