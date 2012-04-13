module Shelby
  class API
    include HTTParty
    base_uri 'api.gt.shelby.tv/v1'
  
    def self.get_roll(id)
      r = get( "/roll/#{id}" ).parsed_response
    end

    def self.get_video_info(frame_id)
      f = get( "/frame/#{frame_id}" ).parsed_response
      if f['status'] == 200
        video_id = f['result']['video_id'] 
        v = get( "/video/#{video_id}" ).parsed_response
        if v['status'] == 200
          
        else
          raise ResultError
        end
      else
        raise ResultError
      end
    end
  
  end
end