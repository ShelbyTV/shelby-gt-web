require 'addressable/uri'
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
    @seo_video = true # let app header know this is an seo page
    # Consider errors and render seovideo page
    @auth_failure  = params[:auth_failure] == '1'
    @auth_strategy = params[:auth_strategy]
    @access_error  = params[:access] == "nos"
    @invite_error  = params[:invite] == "invalid"

    @from_similar_video = params[:s]

    # route guarantees provider_name and provider_id will exist
    @video_provider_name = params.delete(:provider_name)
    @video_provider_id = params.delete(:provider_id)
    @is_mobile = is_mobile?
    @user_signed_in = user_signed_in?

    # set all other @video_ variables relevant to primary video
    getVideo(@video_provider_name, @video_provider_id)
    # if the primary video isn't available, means we can't really show a great page, rescue_from catches error

    # we'll return a page regardless of how successful the rest of these are
    getRecommendedVideos()
    getConversations()
    splitConversationMessagesByNetwork()
    setMetaDescription()

    # A/B tests
    @seo_messaging_v2 = ab_test :seo_messaging_v2

    # if the referrer is google search, parse the search query out of its url
    http_referer = request.env["HTTP_REFERER"]
    if http_referer && http_referer.length > 0
      # the parser doesn't know it's an http url without the protocol, so ensure
      # that it starts with http://
      unless http_referer.start_with? 'http://'
        if http_referer.start_with? 'https://'
          http_referer.slice! 4
        else
          http_referer = 'http://' + http_referer
        end
      end

      begin
        referer_uri = Addressable::URI.parse(http_referer)
      rescue Exception => e
        #don't want to blow up on uri parsing errors, but log them so we have some way of tracking them
        Rails.logger.info "SEO Page Parse Referer URI Failed (ignoring): #{e}"
        return
      end

      if referer_host = referer_uri.host
        if referer_host.start_with?('http://google.') || referer_host.start_with?('google.') || referer_host.include?('.google.')
          if query_values = referer_uri.query_values
            # its a google url so grab the search query
            if @search_query = query_values["q"]
              # check if the google url specified an encoding for the search query and if so decode it accordingly
              if search_query_encoding = query_values["ie"]
                if encoding_obj = Encoding.list.find {|enc| enc.name.casecmp(search_query_encoding) == 0 }
                  # re-encode the search query as UTF-8, respecting the input encoding that was passed to google
                  @search_query.encode!('utf-8', encoding_obj, :invalid => :replace, :undef => :replace, :replace => '?')
                end
              end
            end
          end
        end
      end
    end

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
      raise ActionView::Template::Error.new("Exception while gathering video information.")
    end

    raise ActionView::Template::Error.new("Received no response from API.") unless video_response
    raise ActionController::RoutingError.new("Not found") if video_response.code == "404"
    raise ActionView::Template::Error.new("Received bad response code from API.") unless (video_response.code == "200")
    raise ActionView::Template::Error.new("Received incomplete response from API.") unless video_response.body

    @video_response_body_result = ActiveSupport::JSON.decode(video_response.body)["result"]

    raise ActionView::Template::Error.new("Received bad JSON from API.") unless @video_response_body_result

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

      break if @video_related_videos.length >= 4

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
      next if !conversation["public"]
      next if !message
      next if !message["text"]
      next if !message["public"]

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
