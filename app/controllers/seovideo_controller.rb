require 'uri'
require 'net/http'

class SeovideoController < ApplicationController

  def show
    video_api_base = "http://localhost:4000/v1/video"

    # route guarantees provider_name and provider_id will exist
    @provider_name = params.delete(:provider_name)
    @provider_id = params.delete(:provider_id)

    # don't care about the URL title for now... maybe in the future
    title = params.delete(:title)

    video_url = "#{video_api_base}/find?provider_name=#{@provider_name}&provider_id=#{@provider_id}"

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
    @video_sister_response_body_results = []

    # TODO: need to guarantee ordering by rec score
    video_recommendations.each do |rec|
      video_sister_url = "#{video_api_base}/#{rec["recommended_video_id"]}"
      begin
        video_sister_response = Net::HTTP.get_response(URI.parse(video_sister_url))
      rescue
        next
      end
      if video_sister_response and video_sister_response.body
        if (video_sister_response_decoded = ActiveSupport::JSON.decode(video_sister_response.body))
          if (video_sister_response_decoded_result = video_sister_response_decoded["result"])
            @video_sister_response_body_results.append(video_sister_response_decoded_result)
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

end
