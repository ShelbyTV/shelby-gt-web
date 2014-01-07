class RadarController < ApplicationController

  def index
    @signed_in_user = check_for_signed_in_user
    @user_signed_in = user_signed_in?

    if params.has_key?(Settings::Radar.video_ids)
      @videos = []

      video_ids = params[Settings::Radar.video_ids].split(',')

      video_ids.each do |id|
        @videos << Shelby::API.get_video(id)
      end
    else
      # no videos? alert the user.
    end

  end

end
