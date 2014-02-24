require 'addressable/uri'

module Zeddmore
  class API
    include HTTParty
    base_uri "#{Settings::Application.zeddmore_url}/v1"

    def self.get_videos(date, interval, opts={})
      route = "/videos/#{date}/#{interval}"
      route += "?sort_by=#{opts[:sort_by]}" if opts[:sort_by]
      r = get( route ).parsed_response
      if r['status'] == 'OK'
        return r['videos']
      else
        return 'ERROR'
      end
    end

  end
end
