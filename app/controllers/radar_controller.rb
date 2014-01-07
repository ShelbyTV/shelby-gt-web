class RadarController < ApplicationController

  def index
    @signed_in_user = check_for_signed_in_user
    # this means that the user isn't *really* logged in, delete the cookie and reassign variables appropriatly.
    if @signed_in_user['app_progress'].nil?
      cookies.delete(:_shelby_gt_common, :domain => '.shelby.tv')
      @signed_in_user = check_for_signed_in_user
    end
    @user_signed_in = user_signed_in?

    @videos = []

    params.each do |provider_name, provider_ids|
      # dont look at shit we dont support
      break unless Settings::Radar.video_providers.include?(provider_name)

      provider_ids = params[provider_name]
      provider_ids.each do |provider_id|
        video = Shelby::API.find_or_create_video(provider_name, provider_id)
        # adding these because the find_or_create route doesn't add them :(
        video['provider_name'] = provider_name
        video['provider_id'] = provider_id
        #####
        @videos << video unless video.nil?
      end
    end
  end

end
