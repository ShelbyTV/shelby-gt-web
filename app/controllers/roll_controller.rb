class RollController < ApplicationController
  
  ##
  # GET /roll/:roll_id
  #
  # I'm supporting this, but can't think of who uses/needs this route...
  #
  def show
    
    if user_signed_in?
      set_app_tokens_for_view
      render '/home/app'
    else
      
      # Get all pertinent info from the API (we need all of this no matter what)
      @roll_only = true
      @roll = Shelby::API.get_roll(params[:roll_id])
      @frame = Shelby::API.get_first_frame_on_roll(params[:roll_id])
      @video = Shelby::API.get_video(@frame['video_id']) if @frame
      @user = Shelby::API.get_user(@roll['creator_id']) if @roll
      
      # And render it
      render '/home/landing'
    end
  end
  
  def show_personal_roll
    set_app_tokens_for_view if user_signed_in?
    render '/home/app'
  end
  
  def show_isolated_roll
    set_app_tokens_for_view if user_signed_in?
    render '/home/app'
  end
  
end