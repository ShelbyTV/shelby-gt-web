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
      roll_id = params[:roll_id]
      @roll = BSON::ObjectId.legal?(roll_id) ? Shelby::API.get_roll(roll_id) : nil
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
  
end