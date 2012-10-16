class FacebookGeniusController < ApplicationController
  

  #####
  # main search/home page for fb genius app
  #
  def index
    if frame = params[:frame] and roll = params[:roll]
      return redirect_to fb_genius_frame_path(:roll_id => roll, :frame_id => frame)
    elsif params[:signed_request]
      koala = Koala::Facebook::OAuth.new(Settings::Facebook.genius_app_id, Settings::Facebook.genius_app_secret)
      @un_signed_request = koala.parse_signed_request(params[:signed_request])
    end
    render '/genius/facebook/index'
  end


end