class MobileController < ApplicationController
  include ApplicationHelper
  include MobileHelper

  def landing
    @signed_in_user = check_for_signed_in_user
    if user_signed_in? and @signed_in_user['app_progress'] and (@signed_in_user['app_progress']['onboarding'] != true)
      redirect_to mobile_show_onboarding_path(:step => 1, :service => params[:service])
    elsif user_signed_in?
      redirect_to mobile_stream_path
    end
  end

  def stream
    if user_signed_in?
      @signed_in_user = check_for_signed_in_user
      redirect_to mobile_show_onboarding_path(:step => 1) unless (@signed_in_user['app_progress'] and (@signed_in_user['app_progress']['onboarding'] == true))

      @is_mobile      = is_mobile?
      @user_signed_in = user_signed_in?
      @roll_type      = "stream"

      @page = params[:page].to_i.abs
      @skip = convert_page_to_skip(params[:page])

      d = Shelby::API.get_user_dasboard(current_user_id, request.headers['HTTP_COOKIE'], @skip, Settings::Mobile.default_limit)
      @dashboard = dedupe_dashboard(d)
    else
      redirect_to mobile_landing_path(:status =>"Not logged in.")
    end
  end

  def featured
    @signed_in_user = check_for_signed_in_user
    @user_signed_in = user_signed_in?
    @is_mobile      = is_mobile?

    @page = params[:page].to_i.abs
    @skip = convert_page_to_skip(params[:page])

    featured_dashboard = Shelby::API.get_user_dasboard(Settings::ShelbyAPI.featured_user_id, request.headers['HTTP_COOKIE'], @skip, Settings::Mobile.default_limit)
    @featured_dashboard = dedupe_dashboard(featured_dashboard)
    @roll_type          = "featured"
  end

  def me
    if user_signed_in?
      @signed_in_user = check_for_signed_in_user
      @is_mobile      = is_mobile?
      @user_signed_in = user_signed_in?

      @page = params[:page].to_i.abs
      @skip = convert_page_to_skip(params[:page])

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
      if @roll_with_frames = Shelby::API.get_roll_with_frames(@roll_id, request.headers['HTTP_COOKIE'], @skip, Settings::Mobile.default_limit)
        frames = @roll_with_frames['frames']
        @frames = dedupe_frames(frames)
      else
        @frames = []
      end
    else
      redirect_to mobile_landing_path(:status =>"Not logged in.")
    end
  end

  def roll
    @signed_in_user = check_for_signed_in_user
    @user_signed_in = user_signed_in?
    @is_mobile      = is_mobile?

    @page = params[:page].to_i.abs
    @skip = convert_page_to_skip(params[:page])

    if @user = Shelby::API.get_user(params[:path])
      @roll_id = @user['personal_roll_id']
      @roll_type = "user"
      if @roll_with_frames = Shelby::API.get_roll_with_frames(@roll_id, '', @skip, Settings::Mobile.default_limit)
        frames = @roll_with_frames['frames']
        @frames = dedupe_frames(frames)
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
    @current_step = (params[:step] || 1).to_i
    raise ActionController::RoutingError.new("That step doesnt exist.") unless [1,2].include?(@current_step)
    # TODO:
    # add param on redirect to show what happened.
    #(redirect_to :mobile_landing and return) unless user_signed_in?

    if @current_step == 1
      @service = params[:service]
    elsif @current_step == 2
      @sources = Shelby::API.get_featured_sources
    end

    render "/mobile/onboarding/step_#{@current_step.to_s}".to_sym
  end

  def set_onboarding
    @current_step = params[:step].to_i
    raise ActionController::RoutingError.new("That step doesnt exist.") unless [1,2].include?(@current_step)
    # TODO:
    # add param on redirect to show what happened.
    (redirect_to mobile_landing_path and return) unless user_signed_in?

    @current_user = Shelby::API.get_user(current_user_id)

    if @current_step == 1
      # 1) follow shelby, set open graph preference etc

      # 2) update user app progress
      attrs = {:app_progress => {:onboarding => @current_step}}
      Shelby::API.update_user(@current_user['id'], attrs, request.headers['HTTP_COOKIE'], csrf_token_from_cookie)
    elsif @current_step == 2 and params[:rolls]
      # follow rolls selected
      follow_rolls(params[:rolls])
      # Update user app_progress.onboarding attribute to the appropriate step
      attributes = {:app_progress => {:onboarding => true} }
      update_user(@current_user, attributes)
      # send to their shiney new stream
      redirect_to mobile_stream_path
    else
      # 3) something went horribly wrong.
      redirect_to mobile_landing_path(:status =>"Something bad just happened")
    end
  end

end
