class RollController < ApplicationController
  
  ##
  # GET /roll/:roll_id
  #
  # I'm supporting this, but can't think of who uses/needs this route...
  #
  def show
    
    if user_signed_in?
      render '/home/app'
    else
      
      # Get all pertinent info from the API (we need all of this no matter what)
      @roll_only = true
      @roll = Shelby::API.get_roll(params[:roll_id])
      @user = Shelby::API.get_user(@roll['creator_id']) if @roll
      
      # And render it
      render '/home/app'
    end
  end
  
  def show_personal_roll
    render '/home/app'
  end
  
  def show_isolated_roll
    render '/home/app'
  end
  
  def show_fb_genius_roll
    render '/home/app'
  end
  
end