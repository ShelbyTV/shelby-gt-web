require 'shelby_api'

class FrameController < ApplicationController
  
  # GET /roll/:roll_id/frame/:frame_id
  #
  # optional params:
  #  utm_campaign = < email-share | genius-email >
  #  utm_source = mongo id string
  #
  # Renders the app if the user is signed in (app will show correct stuff)
  # or renders the appropriate logged-out page.
  #
  def show
    
    if user_signed_in?
      set_app_tokens_for_view
      render '/home/app'
    else

      # Determine what kind of page to show based on optional params
      case params[:utm_campaign]
      when "genius-email" then @share_type = :genius
      when "email-share" then @share_type = :email
      else @share_type = :rolling
      end
      
      # Get all pertinent info from the API (we need all of this no matter what)
      @roll = Shelby::API.get_roll(params[:roll_id])
      @frame = Shelby::API.get_frame(params[:frame_id])
      @video = Shelby::API.get_video(@frame['video_id']) if @frame
      if @share_type == :rolling and @roll
        @user = Shelby::API.get_user(@roll['creator_id'])
      else
        @user = Shelby::API.get_user(params[:utm_source])
      end
      
      # And render it
      @mobile_os = detect_mobile_os
      render (@mobile_os ? '/mobile/landing' : '/home/landing')
    end
  end
  
  # GET /frame/:frame_id
  #
  # redirects to roll/:roll_id/frame/:frame_id (just above)
  #
  def just_frame
    frame = Shelby::API.get_frame(params[:frame_id])
    if frame and frame["roll_id"]
      redirect_to "/roll/#{frame["roll_id"]}/frame/#{frame["id"]}"
    else
      redirect_to root_path
    end
  end
  
end