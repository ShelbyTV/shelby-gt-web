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

    # Get all pertinent info from the API
    @roll = Shelby::API.get_roll_with_frames(params[:roll_id])
    @frame = Shelby::API.get_frame(params[:frame_id], true)
    if @frame
      @video = Shelby::API.get_video(@frame['video_id'])
      redirect_to "/video/#{@video["provider_name"]}/#{@video["provider_id"]}"
    else
      render '/home/app'
    end
  end

  # GET /isolated-roll/:roll_id/frame/:frame_id
  # to allow linking to a frame within a subdomain'd iso roll
  #
  def show_frame_in_isolated_roll
    roll = BSON::ObjectId.legal?(params[:roll_id]) ? Shelby::API.get_roll(params[:roll_id]) : nil
    # TODO: remove all of this when new dot tvs go live across the site
    Vanity.playground.experiments[:dot_tv_layout].chooses(:user_profile) if roll && roll['creator_id'] == '4d7ac94af6db241b5d000002'
    @dot_tv_layout = ab_test :dot_tv_layout
    Vanity.playground.experiments[:dot_tv_layout].chooses(nil) if roll && roll['creator_id'] == '4d7ac94af6db241b5d000002'
    # END TODO: remove all of this when new dot tvs go live
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
end
