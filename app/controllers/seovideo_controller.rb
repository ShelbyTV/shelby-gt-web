require 'uri'
require 'net/http'
require 'shelby_api'

class SeovideoController < ApplicationController
helper_method :hyphenateString
before_filter :prepare_for_mobile

  def show
    
    video_api_base = "#{Settings::ShelbyAPI.url}#{Settings::ShelbyAPI.version}/video"

    # route guarantees provider_name and provider_id will exist
    @provider_name = params.delete(:provider_name)
    @provider_id = params.delete(:provider_id)

    # don't care about the URL title for now... maybe in the future
    title = params.delete(:title)

    video_url = "#{video_api_base}/find_or_create?provider_name=#{@provider_name}&provider_id=#{@provider_id}"

    begin
      video_response = Net::HTTP.get_response(URI.parse(video_url))
    rescue
      return render_error(404, "Hit exception while gathering video information.")
    end
    
    return render_error(404, "Received no response from API.") unless video_response
    return render_error(404, "Received bad response code from API.") unless (video_response.code == "200")
    return render_error(404, "Received incomplete response from API.") unless video_response.body

    @video_response_body_result = ActiveSupport::JSON.decode(video_response.body)["result"]
    return render_error(404, "Received bad info from API.") unless @video_response_body_result

    count = 0
    video_recommendations = @video_response_body_result["recs"]
    @video_related_response_body_results = []

    # TODO: need to guarantee ordering by rec score
    video_recommendations.each do |rec|
      video_related_url = "#{video_api_base}/#{rec["recommended_video_id"]}"
      begin
        video_related_response = Net::HTTP.get_response(URI.parse(video_related_url))
      rescue
        next
      end
      if video_related_response and video_related_response.body
        if (video_related_response_decoded = ActiveSupport::JSON.decode(video_related_response.body))
          if (video_related_response_decoded_result = video_related_response_decoded["result"])
            @video_related_response_body_results.append(video_related_response_decoded_result)
            count += 1
          end
        end
      end
      break if count >= 3
    end if video_recommendations

    @video_title = @video_response_body_result["title"]
    @video_description = @video_response_body_result["description"]
    @video_author = @video_response_body_result["author"]
    @video_duration = prettyDuration(@video_response_body_result["duration"])
    @video_id = @video_response_body_result["id"]
    @video_embed = @video_response_body_result["embed_url"]

    conversations_url = "#{video_api_base}/#{@video_id}/conversations"

    begin
      conversations_response = Net::HTTP.get_response(URI.parse(conversations_url))
    rescue
      conversations_response = nil
    end

    if (conversations_response and conversations_response.code == "200")
      if conversations_response.body
        if (conversations_response_body_decoded = ActiveSupport::JSON.decode(conversations_response.body))
          @conversations = conversations_response_body_decoded["result"]
          if (@conversations and 
              @conversations.first and
              @conversations.first["messages"] and
              @conversations.first["messages"].first)
            first_message = @conversations.first["messages"].first
            # can't use double-quotes anywhere, since it's going in a meta tag
            first_message_text = first_message["text"].gsub /"/, "'"
            if first_message['origin_network'] && first_message['origin_network'] == 'twitter' 
              @meta_description = "Shared by @#{first_message['nickname']} (#{first_message['created_at']}): #{first_message_text}" 
            else
              @meta_description = "Shared by #{first_message['nickname']} (#{first_message['created_at']}): #{first_message_text}" 
            end
          else
            @meta_description = Settings::Application.meta_description 
          end
        end
      end
    end
  end

private

  def prettyDuration(durationString)
    begin
      duration = durationString.to_i
    rescue
      return "error"
    end

    if duration < 60
      return sprintf('0:%02d', duration)
    elsif duration < 3600 
      return sprintf('%d:%02d', duration / 60, duration % 60)
    elsif duration < (3600 * 24)
      return sprintf('%:%02d:%02d', duration / 3600, duration / 60, duration % 60)
    else
      return "> 1 day"
    end
  end

  def mobile_device?
    request.user_agent =~ /Mobile|webOS/
  end
  
  def prepare_for_mobile
    if params[:mobile] != nil
      if params[:mobile] == "1" 
        request.format = :mobile
      else
        request.format = :html
      end
    else
      request.format = :mobile if mobile_device?
    end
  end

def hyphenateString(title)
  title.downcase.gsub(/\W/,'-').squeeze('-').chomp('-')
end


end
