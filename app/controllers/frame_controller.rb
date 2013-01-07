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
    # Determine what kind of share_type this is based on optional params
    # Genius rolls not working in the app, so sending those the landing page even if you're logged in
    case params[:utm_campaign]
    when "genius-email" then @share_type = :genius
    when "email-share" then @share_type = :email
    else @share_type = :rolling
    end

    if user_signed_in? and @share_type != :genius
      render '/home/app'
    else

      # Get all pertinent info from the API
      @roll = Shelby::API.get_roll(params[:roll_id])
      @frame = Shelby::API.get_frame(params[:frame_id], true)
      @video = Shelby::API.get_video(@frame['video_id']) if @frame
      if @share_type == :rolling and @frame
        @user = Shelby::API.get_user(@frame['creator_id'])
      else
        @user = Shelby::API.get_user(params[:utm_source])
      end

      # A/B test
      @seo_search_messaging = ab_test :seo_search_messaging

      # And render it
      @mobile_os = detect_mobile_os
      render @mobile_os ? '/mobile/landing' : '/home/landing'

    end
  end

  # GET /isolated-roll/:roll_id/frame/:frame_id
  # to allow linking to a frame within a subdomain'd iso roll
  #
  def show_frame_in_isolated_roll
    render '/home/app'
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

  def show_fb_genius_frame
    # Get all pertinent info from the API
    @roll = Shelby::API.get_roll(params[:roll_id])
    @frame = Shelby::API.get_frame(params[:frame_id], true)
    @video = Shelby::API.get_video(@frame['video_id']) if @frame

    @share_type = :fb_genius

    # And render it
    render '/home/landing'
  end

end