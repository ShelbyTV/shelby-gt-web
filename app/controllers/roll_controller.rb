class RollController < ApplicationController

  before_filter :init_ab_tests

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
    user_id_or_nickname = params[:user_id_or_nickname]
    @user = Shelby::API.get_user(user_id_or_nickname) if user_id_or_nickname
    @roll = Shelby::API.get_roll_with_frames(@user['personal_roll_id'], request.headers['HTTP_COOKIE']) if @user
    render '/home/app'
  end

  def show_isolated_roll
    get_roll_and_roll_creator_by_roll_id
    render '/home/app'
  end

  def subscribe_via_email
    @roll_id = params[:roll_id]
    @roll_title = params[:roll_title]
    @curator_name = params[:curator]
    @current_user_label = user_signed_in? ? current_user_id : "anonymous"
  end

  private

    def init_ab_tests
      @share_button_icon = ab_test :share_button_icon
    end

    def get_roll_and_roll_creator_by_roll_id
      roll_id = params[:roll_id]
      @roll = BSON::ObjectId.legal?(roll_id) ? Shelby::API.get_roll_with_frames(roll_id, '') : nil
      @user = Shelby::API.get_user(@roll['creator_id']) if @roll
    end

end
