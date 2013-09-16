class MobileController < ApplicationController
  include ApplicationHelper

  def landing
    @signed_in_user = check_for_signed_in_user
  end

  def stream
    if user_signed_in?
      @signed_in_user = check_for_signed_in_user
      redirect_to :mobile_show_onboarding unless @signed_in_user['app_progress'] and @signed_in_user['app_progress']['onboarding'] == true
      @dashboard      = Shelby::API.get_user_dasboard(current_user_id, request.headers['HTTP_COOKIE'])
      @is_mobile      = is_mobile?
      @user_signed_in = user_signed_in?
      @roll_type      = "stream"
    else
      # TODO:
      # add param on redirect to show what happened.
      redirect_to :mobile_landing
    end
  end

  def featured
    @signed_in_user     = check_for_signed_in_user
    @featured_dashboard = Shelby::API.get_user_dasboard(Settings::ShelbyAPI.featured_user_id, request.headers['HTTP_COOKIE'])
    @roll_type          = "featured"
  end

  def me
    if user_signed_in?
      @signed_in_user = check_for_signed_in_user
      @is_mobile      = is_mobile?
      @user_signed_in = user_signed_in?

      if params[:path] == "/likes"
        @roll_type = "likes"
        @roll_id   = @signed_in_user['watch_later_roll_id']
      elsif params[:path] == "/shares"
        @roll_type = "shares"
        @roll_id   = @signed_in_user['personal_roll_id']
      elsif params[:path]
        raise ActionController::RoutingError.new("Route doesn't exist.")
      else
        @roll_type = "shares"
        @roll_id   = @signed_in_user['personal_roll_id']
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

  def roll
    @signed_in_user = check_for_signed_in_user

    if @user = Shelby::API.get_user(params[:path])
      @roll_id = @user['personal_roll_id']
      @roll_type = "user"
      if @roll_with_frames = Shelby::API.get_roll_with_frames(@roll_id, '')
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

  def signout
    flash[:error] = params[:error]
    # def dont want this around (API tries to kill it, too)
    cookies.delete(:_shelby_gt_common)
    redirect_to Settings::ShelbyAPI.url + "/sign_out_user"
  end

  def show_onboarding
    @signed_in_user = check_for_signed_in_user
    @current_step = params[:path].to_i
    raise ActionController::RoutingError.new("That step doesnt exist.") unless [1,2].include?(@current_step)
    # TODO:
    # add param on redirect to show what happened.
    #(redirect_to :mobile_landing and return) unless user_signed_in?

    if @current_step == 1
      @services = @signed_in_user['authentications']
    elsif @current_step == 2
      @sources = Shelby::API.get_featured_sources
    end

    @current_user = Shelby::API.get_user(current_user_id)
    render "/mobile/onboarding/step_#{@current_step.to_s}".to_sym
  end

  def set_onboarding
    @current_step = params[:path].to_i
    raise ActionController::RoutingError.new("That step doesnt exist.") unless [1,2].include?(@current_step)
    # TODO:
    # add param on redirect to show what happened.
    (redirect_to :mobile_landing and return) unless user_signed_in?

    @current_user = Shelby::API.get_user(current_user_id)

    # TODO:
    if @current_step == 1
      # 1) follow rolls, follow shelby, set open graph preference etc

    elsif @current_step == 2
      # 2) Update user app_progress.onboarding attribute to the appropriate step
    else
      # 3) something went horribly wrong.
      redirect_to :mobile_landing
    end
  end

end
