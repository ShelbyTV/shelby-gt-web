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
      get_roll_and_roll_creator_by_roll_id
      render '/home/app'
    end
  end

  def show_personal_roll
    user_id = params[:user_id]
    @user = Shelby::API.get_user(user_id) if user_id
    @roll = Shelby::API.get_roll(@user['personal_roll_id']) if @user
    render '/home/app'
  end

  def show_isolated_roll
    get_roll_and_roll_creator_by_roll_id
    render '/home/app'
  end

  def show_fb_genius_roll
    @genius_roll_id = params[:roll_id]
    render '/home/app'
  end

end

  private

    def get_roll_and_roll_creator_by_roll_id
      roll_id = params[:roll_id]
      @roll = BSON::ObjectId.legal?(roll_id) ? Shelby::API.get_roll(roll_id) : nil
      @user = Shelby::API.get_user(@roll['creator_id']) if @roll
    end

end