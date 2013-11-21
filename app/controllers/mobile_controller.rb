class MobileController < ApplicationController
  include ApplicationHelper
  include MobileHelper

  def landing
    ## handle possible error messages ##########
    @status, @msg = params[:status], params[:msg]
    @auth_failure  = params[:auth_failure] == '1'
    @auth_strategy = params[:auth_strategy]
    #####################################

    @signed_in_user = check_for_signed_in_user
    @user_signed_in = user_signed_in?
    @is_mobile      = is_mobile?

    if @signed_in_user['app_progress'].nil?
      cookies.delete(:_shelby_gt_common)
      @signed_in_user = check_for_signed_in_user
      @user_signed_in = user_signed_in?
    end

    if user_signed_in? and @signed_in_user and @signed_in_user.has_key?("app_progress") and (@signed_in_user['app_progress']['onboarding'] != true)
      users_first_auth = !@signed_in_user['authentications'].empty? ? @signed_in_user['authentications'].first : {}
      authed_service = params[:service] || users_first_auth['provider'] || "facebook"
      redirect_to mobile_show_onboarding_path(:step => 1, :service => authed_service)
    elsif user_signed_in?
      log_session()
      redirect_to mobile_stream_path
    else
      @mobile_signup_url = Settings::ShelbyAPI.url+"/auth/facebook?service=facebook&origin="+Settings::Application.mobile_url
      render '/home/landing', :layout => false
    end
  end

  def stream
    if user_signed_in?
      @signed_in_user = check_for_signed_in_user
      if @signed_in_user['app_progress'].nil?
        cookies.delete(:_shelby_gt_common)
        (redirect_to mobile_landing_path(:msg =>"You must be logged in.", :status => 401) and return)
      end

      (redirect_to mobile_show_onboarding_path(:step => 1) and return) unless (!@signed_in_user.nil? and (@signed_in_user['app_progress']['onboarding'] == true))

      @is_mobile      = is_mobile?
      @user_signed_in = user_signed_in?
      @roll_type      = Settings::Mobile.roll_types['stream']

      @page = params[:page].to_i.abs
      @skip = convert_page_to_skip(params[:page])

      d = Shelby::API.get_user_dashboard(current_user_id, request.headers['HTTP_COOKIE'], @skip, Settings::Mobile.default_limit, params[:entry])
      @dashboard = dedupe_dashboard(d)
    else
      redirect_to mobile_landing_path(:msg =>"You must be logged in.", :status => 401)
    end
  end

  def featured
    @signed_in_user = check_for_signed_in_user
    @user_signed_in = user_signed_in?
    @is_mobile      = is_mobile?

    @page = params[:page].to_i.abs
    @skip = convert_page_to_skip(params[:page])

    cookie = request.headers['HTTP_COOKIE'] || ' '

    featured_dashboard = Shelby::API.get_user_dashboard(Settings::ShelbyAPI.featured_user_id, cookie, @skip, Settings::Mobile.default_limit)
    @featured_dashboard = dedupe_dashboard(featured_dashboard)
    @roll_type          = Settings::Mobile.roll_types['featured']
  end

  def me
    if user_signed_in?
      @signed_in_user = check_for_signed_in_user
      @is_mobile      = is_mobile?
      @user_signed_in = user_signed_in?

      @page = params[:page].to_i.abs
      @skip = convert_page_to_skip(params[:page])

      if params[:type] == Settings::Mobile.roll_types['likes']
        @roll_type = Settings::Mobile.roll_types['likes']
        @roll_id   = @signed_in_user['watch_later_roll_id']
      elsif params[:type] == Settings::Mobile.roll_types['shares']
        @roll_type = Settings::Mobile.roll_types['shares']
        @roll_id   = @signed_in_user['personal_roll_id']
      elsif params[:type]
        raise ActionController::RoutingError.new("Route doesn't exist.")
      else
        @roll_type = Settings::Mobile.roll_types['shares']
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

  def preferences
    if user_signed_in?
      @signed_in_user = check_for_signed_in_user
      @is_mobile      = is_mobile?
      @user_signed_in = user_signed_in?

      @section = params[:section] || Settings::Mobile.preferences_sections.profile

      case @section
        when Settings::Mobile.preferences_sections.sources
          @sources = Shelby::API.get_featured_sources
        when Settings::Mobile.preferences_sections.notifications
        else
      end

      render "/mobile/preferences_#{@section}"
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

    if @signed_in_user['nickname'] == params[:username]
      redirect_to mobile_me_path(:type => "shares")
    elsif @user = Shelby::API.get_user(params[:username])
      @roll_id = @user['personal_roll_id']
      @roll_type = Settings::Mobile.roll_types['user']

      # is signed_in_user following the user being displayed?
      if user_signed_in? and @followings = Shelby::API.get_user_followings(@signed_in_user['id'], request.headers['HTTP_COOKIE'])
        @is_following = @followings.map{ |user| user['id'] }.include?(@user['personal_roll_id'])
      end

      cookie = request.headers['HTTP_COOKIE'] || ' '

      if @roll_with_frames = Shelby::API.get_roll_with_frames(@roll_id, cookie, @skip, Settings::Mobile.default_limit)
        frames = @roll_with_frames['frames']
        @frames = dedupe_frames(frames)
      else
        @frames = []
      end
    else
      raise ActionController::RoutingError.new("We can't find the content you are looking for.")
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
    #(redirect_to mobile_landing_path(:status=> "You must be logged in.") and return) unless user_signed_in?

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
    (redirect_to mobile_landing_path(:status=> "You must be logged in.") and return) unless user_signed_in?

    @current_user = Shelby::API.get_user(current_user_id)

    if @current_step == 1
      # follow shelby, set open graph preference etc
      EM.next_tick { set_timeline_preference(@current_user, params[:onboarding_timeline_sharing]) }
      EM.next_tick { follow_shelby(user, params[:onboarding_follow_shelby]) }
      attributes = {:app_progress => {:onboarding => @current_step}}
      update_user(@current_user, attributes)
      redirect_to mobile_show_onboarding_path(:step => 2)
    elsif @current_step == 2 and params[:rolls]
      EM.next_tick { follow_rolls(params[:rolls]) }
      attributes = {:app_progress => {:onboarding => true} }
      update_user(@current_user, attributes)
      redirect_to mobile_stream_path
    else
      redirect_to mobile_landing_path(:status =>"Something bad just happened")
    end
  end

end
