require 'uri'
require 'net/http'
require 'shelby_api'
require 'iconv'

class SeovideoController < ApplicationController

  helper_method :hyphenateString

  @@video_api_base = "#{Settings::ShelbyAPI.url}#{Settings::ShelbyAPI.version}/video"

  #
  # this method contacts the API server to gather all the required information
  # for the video page.
  #
  # info is put into member variables that are accessed by the layout and template
  #
  def show

    # route guarantees provider_name and provider_id will exist
    @video_provider_name = params.delete(:provider_name)
    @video_provider_id = params.delete(:provider_id)

    begin
      # sets all other @video_ variables relevant to primary video
      getVideo(@video_provider_name, @video_provider_id)
    rescue Exception => e
      # if the primary video isn't available, means we can't really show a great page. return 404 for now...
      return render_error(404, e.message)
    end

    # we'll return a page regardless of how successful the rest of these are
    getRecommendedVideos()
    getConversations()
    splitConversationMessagesByNetwork()
    setMetaDescription()

    # A/B tests
    @seo_ad_videocard = ab_test :seo_ad_videocard
    @seo_search_position = ab_test :seo_search_position

    respond_to do |format|
      format.html { render }
      format.any { head :not_found }
    end

  end


private

  def getVideo(provider_name, provider_id)

    video_url = "#{@@video_api_base}/find_or_create?provider_name=#{provider_name}&provider_id=#{provider_id}"

    begin
      video_response = Net::HTTP.get_response(URI.parse(video_url))
    rescue
      raise "Exception while gathering video information."
    end

    raise "Received no response from API." unless video_response
    raise "Received bad response code from API." unless (video_response.code == "200")
    raise "Received incomplete response from API." unless video_response.body

    @video_response_body_result = ActiveSupport::JSON.decode(video_response.body)["result"]

    raise "Received bad JSON from API." unless @video_response_body_result

    @video_title = @video_response_body_result["title"]
    @video_description = @video_response_body_result["description"]
    @video_author = @video_response_body_result["author"]
    @video_duration = prettyDuration(@video_response_body_result["duration"])
    @video_id = @video_response_body_result["id"]
    @video_embed = @video_response_body_result["embed_url"]
    @video_thumbnail_url = @video_response_body_result["thumbnail_url"]
    @video_related_ids = @video_response_body_result["recs"]
    @video_source_url = @video_response_body_result['source_url']

  end


  def getRecommendedVideos()

    @video_related_videos = []

    # TODO: need to guarantee ordering by rec score
    @video_related_ids.each do |rec|

      break if @video_related_videos.length >= 3

      begin
        url = "#{@@video_api_base}/#{rec["recommended_video_id"]}"
        response = Net::HTTP.get_response(URI.parse(url))

        next if !response
        next if !response.body
        next if !(decoded = ActiveSupport::JSON.decode(response.body))
        next if !(result = decoded["result"])

        @video_related_videos.push(result)

      rescue
        next
      end

    end if @video_related_ids

  end


  def getConversations()

    begin
      url = "#{@@video_api_base}/#{@video_id}/conversations"

      response = Net::HTTP.get_response(URI.parse(url))

      return if !response
      return if response.code != "200"
      return if !response.body
      decoded = ActiveSupport::JSON.decode(response.body)
      return if !decoded

      @conversations = decoded["result"]

    rescue
      return
    end

  end


  def splitConversationMessagesByNetwork()

    @messages = {
                  :shelby => [],
                  :facebook => [],
                  :twitter => [],
                  :tumblr => []
                }

    @conversations.each do |conversation|
      message = conversation["messages"].first
      next if !message
      next if !message["text"]

      case message["origin_network"]
        when "shelby"   then @messages[:shelby].push(message)
        when "facebook" then @messages[:facebook].push(message)
        when "twitter"  then @messages[:twitter].push(message)
        when "tumblr"   then @messages[:tumblr].push(message)
        else                 @messages[:shelby].push(message)
      end
    end if @conversations

  end


  def setMetaDescription()

    # default description in case first message has issues... can't use double-quotes anywhere, since it's going in a meta tag
    if @video_description
      @meta_description = @video_description.gsub /"/, "'"
    else
      @meta_description = Settings::Application.meta_description
    end

    return if !@conversations
    return if !@conversations.first
    return if !@conversations.first["messages"]
    return if !@conversations.first["messages"].first
    return if !@conversations.first["messages"].first["text"]

    message = @conversations.first["messages"].first
    nickname = message["nickname"]

    # can't use double-quotes in a meta tag; need to make sure we're using valid UTF-8
    ic = Iconv.new("UTF-8//IGNORE", "UTF-8")
    text = ic.iconv(message["text"] + " ")[0..-2].gsub /"/, "'"

    if message["origin_network"] and message["origin_network"] == "twitter"
      nickname = "@#{nickname}"
    end

    @meta_description = "Shared by #{nickname} (#{message['created_at']}): #{text}"

  end


  def prettyDuration(durationString)

    begin
      duration = durationString.to_i

      if duration < 60
        return sprintf('0:%02d', duration)
      elsif duration < 3600
        return sprintf('%d:%02d', duration / 60, duration % 60)
      elsif duration < (3600 * 24)
        return sprintf('%d:%02d:%02d', duration / 3600, duration / 60, duration % 60)
      else
        return "> 1 day"
      end

    rescue
      return "error"
    end

  end


  def hyphenateString(title)

    title ? title.downcase.gsub(/\W/,'-').gsub(/"/,"'").squeeze('-').chomp('-') : ""

  end

end
