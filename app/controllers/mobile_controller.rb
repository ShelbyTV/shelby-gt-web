class MobileController < ApplicationController

  def mobile_search
    # render just search box
    @query_param = params[:query]
  end

  def mobile_results
    if params[:term]
      # do yt search and show results page
      @term = params[:term]#.gsub!(/\W/, '-')
      client = YouTubeIt::Client.new
      search_result = client.videos_by(:query => @term, :order_by => "relevance", :per_page => 50)
      @urls = []
      search_result.videos.each { |v| @urls << v.player_url }
      @urls = [@urls.join(',')].to_json
      # post to shelby to get genius
      if @roll = Shelby::API.post_to_genius(@term, @urls) and @frames = Shelby::API.get_frames_in_roll(@roll["id"])

      end
    end
  end
  
end