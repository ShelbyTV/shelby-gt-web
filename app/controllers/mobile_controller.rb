class MobileController < ApplicationController

  def landing

  end

  def stream
    if user_signed_in?
      @current_user = Shelby::API.get_user(current_user_id)
      @dashboard = Shelby::API.get_user_dasboard(current_user_id)
    else
      redirect_to '/m'
    end
  end

  def featured
    @current_user = Shelby::API.get_user(current_user_id) if user_signed_in?
    @featured_dashboard = Shelby::API.get_user_dasboard(Settings::ShelbyAPI.featured_user_id)
  end

  def me
    if user_signed_in?
      @current_user = Shelby::API.get_user(current_user_id)
      # default to shares. otherwise go to likes
      if params[:path] == "likes"
        @roll_type = "likes"
        @roll_id = @current_user['watch_later_roll_id']
      else
        @roll_type = "shares"
        @roll_id = @current_user['personal_roll_id']
      end
      @roll_with_frames = Shelby::API.get_roll_with_frames(roll_id)
    else
      redirect_to '/m'
    end
  end

end
