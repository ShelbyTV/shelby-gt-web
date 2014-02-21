require 'addressable/uri'

module Zeddmore
  class API
    include HTTParty
    base_uri "#{Settings::Application.zeddmore_url}/v1"

    def self.get_videos(date, interval)
      r = get( "/videos/#{date}/#{interval}" ).parsed_response
      if r['status'] == 'OK'
        return r['videos']
      else
        return 'ERROR'
      end
    end

  end
end
