class MobileController < ApplicationController

  def landing

  end

  def stream
    if user_signed_in?
      @current_user = Shelby::API.get_user(current_user_id)
      @dashboard = Shelby::API.get_user_dasboard(current_user_id, request.headers['HTTP_COOKIE'])
    else
      # TODO:
      # add param on redirect to show what happened.
      redirect_to :mobile_landing
    end
  end

  def featured
    @current_user = Shelby::API.get_user(current_user_id) if user_signed_in?
    @featured_dashboard = Shelby::API.get_user_dasboard(Settings::ShelbyAPI.featured_user_id, request.headers['HTTP_COOKIE'])
  end

  def me
    if user_signed_in?
      @current_user = Shelby::API.get_user(current_user_id, request.headers['HTTP_COOKIE'])
      if params[:path] == "/likes"
        @roll_type = "likes"
        @roll_id = @current_user['watch_later_roll_id']
      elsif params[:path] == "/shares"
        @roll_type = "shares"
        @roll_id = @current_user['personal_roll_id']
      else
        # TODO:
        # Raise 404 instead of below
        @roll_type = "shares"
        @roll_id = @current_user['personal_roll_id']
      end
      if @roll_with_frames = Shelby::API.get_roll_with_frames(@roll_id, request.headers['HTTP_COOKIE'])
        @frames = @roll_with_frames['frames']
      else
        @frames = []
      end
    else
        # TODO:
        # add param on redirect to show what happened.
      redirect_to :mobile_landing
    end
  end

  def shares

  end

  def signout
    flash[:error] = params[:error]

    # def dont want this around (API tries to kill it, too)
    cookies.delete(:_shelby_gt_common)

    redirect_to Settings::ShelbyAPI.url + "/sign_out_user"
  end

end
