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

    # this means that the user isn't *really* logged in, delete the cookie and reassign variables appropriatly.
    if @signed_in_user['app_progress'].nil?
      cookies.delete(:_shelby_gt_common, :domain => '.shelby.tv')
      @signed_in_user = check_for_signed_in_user
      @user_signed_in = user_signed_in?
    end

    if user_signed_in? and @signed_in_user and @signed_in_user.has_key?("app_progress") and ((@signed_in_user['app_progress']['onboarding'] != true) or @signed_in_user['app_progress'['onboarding'] == "iOS_iPhone"])
      users_first_auth = !@signed_in_user['authentications'].empty? ? @signed_in_user['authentications'].first : {}
      authed_service = params[:service] || users_first_auth['provider'] || "facebook"
      redirect_to(mobile_show_onboarding_path(:step => 1, :service => authed_service)) and return
    elsif user_signed_in?
      log_session()
      redirect_to(mobile_stream_path) and return
    else
      @mobile_signup_url = Settings::ShelbyAPI.url+"/auth/facebook?service=facebook&origin="+Settings::Application.mobile_url
      render '/home/landing', :layout => false
    end
  end

  def stream
    if user_signed_in?
      check_for_signed_in_user_and_issues

      unless (@signed_in_user['app_progress'] and ((@signed_in_user['app_progress']['onboarding'] == true) or @signed_in_user['app_progress'['onboarding'] == "iOS_iPhone"]))
        redirect_to(appropriate_subdirectory+mobile_show_onboarding_path(:step => 1)) and return
      end

      @is_mobile      = is_mobile?
      @user_signed_in = user_signed_in?
      @roll_type      = Settings::Mobile.roll_types['stream']

      @page = params[:page].to_i.abs
      @skip = convert_page_to_skip(params[:page])

      d = Shelby::API.get_user_dashboard(current_user_id, request.headers['HTTP_COOKIE'], @skip, Settings::Mobile.default_limit, params[:entry])
      @dashboard = dedupe_dashboard(d)
    else
      redirect_to(appropriate_subdirectory+mobile_landing_path(:msg => Settings::ErrorMessages.must_be_logged_in, :status => 401)) and return
    end
  end

  def featured
    @signed_in_user = check_for_signed_in_user
    @user_signed_in = user_signed_in?
    @is_mobile      = is_mobile?

    # this means that the user isn't *really* logged in, delete the cookie and let the person be
    if @signed_in_user['app_progress'].nil?
      cookies.delete(:_shelby_gt_common, :domain => '.shelby.tv')
    end

    @page = params[:page].to_i.abs
    @skip = convert_page_to_skip(params[:page])

    cookie = request.headers['HTTP_COOKIE'] || ' '

    @featured_dashboard = Shelby::API.get_user_dashboard(Settings::ShelbyAPI.featured_user_id, cookie, @skip, Settings::Mobile.default_limit)
    @featured_dashboard = dedupe_dashboard(@featured_dashboard)
    @roll_type          = Settings::Mobile.roll_types['featured']
  end

  def me
    if user_signed_in?
      check_for_signed_in_user_and_issues
      @user           = @signed_in_user

      @page = params[:page].to_i.abs
      @skip = convert_page_to_skip(params[:page])

      case params[:type]
        when Settings::Mobile.roll_types['likes']
          @roll_type = Settings::Mobile.roll_types['likes']
          @roll_id   = @signed_in_user['watch_later_roll_id']
        when Settings::Mobile.roll_types['activity']
          @roll_type = Settings::Mobile.roll_types['activity']
          @roll_id   = @signed_in_user['personal_roll_id']
        else
          raise ActionController::RoutingError.new(Settings::ErrorMessages.route_does_not_exist)
      end


      if @roll_with_frames = Shelby::API.get_roll_with_frames(@roll_id, request.headers['HTTP_COOKIE'], @skip, Settings::Mobile.default_limit)
        frames = @roll_with_frames['frames']
        @frames = dedupe_frames(frames)
      else
        @frames = []
      end
    else
      redirect_to(appropriate_subdirectory+mobile_landing_path(:status => Settings::ErrorMessages.not_logged_in)) and return
    end
  end

  def following
    # this method is basically the same as mobile#me in this controller.
    # separating the logic that grabs Users from the logic that grabs Frames, Rolls, etc.

    if user_signed_in?
      check_for_signed_in_user_and_issues

      @roll_type = Settings::Mobile.roll_followings
      @users = Shelby::API.get_user_followings(@signed_in_user['id'],request.headers['HTTP_COOKIE'])

      render "/mobile/me" #same template as mobile#me method
    else
      redirect_to(appropriate_subdirectory+mobile_landing_path(:status => Settings::ErrorMessages.not_logged_in)) and return
    end
  end

  def preferences
    if user_signed_in?
      check_for_signed_in_user_and_issues

      @section = params[:section] || Settings::Mobile.preferences_sections.profile

      case @section
        when Settings::Mobile.preferences_sections.sources
          @sources = Shelby::API.get_featured_sources
        when Settings::Mobile.preferences_sections.notifications
          @preferences = @signed_in_user['preferences']
        when Settings::Mobile.preferences_sections.profile
          @user = @signed_in_user
        else
      end

      render "/mobile/preferences_#{@section}"
    else
      redirect_to(appropriate_subdirectory+mobile_landing_path(:status => Settings::ErrorMessages.not_logged_in)) and return
    end
  end

  def notifications
    if user_signed_in?
      check_for_signed_in_user_and_issues

      @section = Settings::Mobile.preferences_sections.notifications
      @preferences = @signed_in_user['preferences']


      @preferences.each do |preference,value|
        @preferences[preference] = params.has_key?(preference)
      end

    update_user(@signed_in_user, {:preferences => @preferences})

    #TODO: this needs error/success handling

      render "/mobile/preferences_#{@section}"
    else
      redirect_to(appropriate_subdirectory+mobile_landing_path(:status => Settings::ErrorMessages.not_logged_in)) and return
    end
  end

  def profile
    if user_signed_in?
      check_for_signed_in_user_and_issues

      @section = Settings::Mobile.preferences_sections.profile

      data = {}

      data[:name] = params['userFullname'] if params['userFullname']
      data[:nickname] = params['userNickname'] if params['userNickname']
      data[:primary_email] = params['userEmail'] if params['userEmail']

      response = update_user(@signed_in_user, data)
      errors = response.parsed_response['errors']

      flash[:errors_primary_email] = Shelby::HashErrorChecker.get_hash_error(errors, ['user', 'primary_email'])
      flash[:errors_nickname] = Shelby::HashErrorChecker.get_hash_error(errors, ['user', 'nickname'])

      #TODO: this needs error/success handling

      redirect_to(appropriate_subdirectory + "/preferences/" + Settings::Mobile.preferences_sections.profile) and return
    else
      redirect_to(appropriate_subdirectory+mobile_landing_path(:status => Settings::ErrorMessages.not_logged_in)) and return
    end
  end

  def roll
    @signed_in_user = check_for_signed_in_user
    @user_signed_in = user_signed_in?
    @is_mobile      = is_mobile?

    # this means that the user isn't *really* logged in, delete the cookie and let the person be
    if @signed_in_user['app_progress'].nil?
      cookies.delete(:_shelby_gt_common, :domain => '.shelby.tv')
    end

    @page = params[:page].to_i.abs
    @skip = convert_page_to_skip(params[:page])

    if @signed_in_user['nickname'] == params[:username]
      redirect_to(appropriate_subdirectory+mobile_me_path(:type => "shares")) and return
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

      # render "/mobile/me" #same template as mobile#me method
    elsif !(params[:username]=~/.jpg|.png|.gif|.js/) and (@roll = Shelby::API.get_roll(params[:username]))
      @user = Shelby::API.get_user(@roll['creator_id'])
      @roll_type = Settings::Mobile.roll_types['user']

      # is signed_in_user following the user being displayed?
      if user_signed_in? and @followings = Shelby::API.get_user_followings(@signed_in_user['id'], request.headers['HTTP_COOKIE'])
        @is_following = @followings.map{ |user| user['id'] }.include?(@user['personal_roll_id'])
      end

      cookie = request.headers['HTTP_COOKIE'] || ' '
      if @roll_with_frames = Shelby::API.get_roll_with_frames(@roll['id'], cookie, @skip, Settings::Mobile.default_limit)
        frames = @roll_with_frames['frames']
        @frames = dedupe_frames(frames)
      else
        @frames = []
      end
    else
      raise ActionController::RoutingError.new(Settings::ErrorMessages.content_not_found)
    end
  end

  def signout
    flash[:error] = params[:error]
    # def dont want this around (API tries to kill it, too)
    cookies.delete(:_shelby_gt_common, :domain => '.shelby.tv')
    redirect_to(Settings::ShelbyAPI.url + "/sign_out_user") and return
  end

  def show_onboarding
    @signed_in_user = check_for_signed_in_user
    @current_step = (params[:step] || 1).to_i
    raise ActionController::RoutingError.new(Settings::ErrorMessages.step_does_not_exist) unless [1,2].include?(@current_step)
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
    raise ActionController::RoutingError.new(Settings::ErrorMessages.step_does_not_exist) unless [1,2].include?(@current_step)
    (redirect_to(appropriate_subdirectory+mobile_landing_path(:status=> Settings::ErrorMessages.must_be_logged_in)) and return) unless user_signed_in?

    @current_user = Shelby::API.get_user(current_user_id)

    if @current_step == 1
      # follow shelby, set open graph preference etc
      EM.next_tick { set_timeline_preference(@current_user, params[:onboarding_timeline_sharing]) }
      EM.next_tick { follow_shelby(user, params[:onboarding_follow_shelby]) }
      attributes = {:app_progress => {:onboarding => @current_step}}
      update_user(@current_user, attributes)
      redirect_to(appropriate_subdirectory+mobile_show_onboarding_path(:step => 2)) and return
    elsif @current_step == 2 and params[:rolls]
      EM.next_tick { follow_rolls(params[:rolls]) }
      attributes = {:app_progress => {:onboarding => true} }
      update_user(@current_user, attributes)
      redirect_to(appropriate_subdirectory+mobile_stream_path) and return
    else
      redirect_to(appropriate_subdirectory+mobile_landing_path(:status => Settings::ErrorMessages.step_does_not_exist)) and return
    end
  end

  private

  def check_for_signed_in_user_and_issues
    @signed_in_user = check_for_signed_in_user
    @user_signed_in = user_signed_in?
    @is_mobile      = is_mobile?

    # this means that the user isn't *really* logged in, delete the cookie and redirect to landing
    if @signed_in_user['app_progress'].nil?
      cookies.delete(:_shelby_gt_common, :domain => '.shelby.tv')
      redirect_to(appropriate_subdirectory+mobile_landing_path(:msg =>"Eeek, Something went wrong. Try logging in again.", :status => 401)) and return
    end
  end

end
