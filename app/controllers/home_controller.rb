require 'shelby_api'

class HomeController < ApplicationController
  include MobileHelper
  helper :meta_tag

  # In non-pushstate browsers, Backone redirects to shelby.tv/hash_app#<the original fragment>
  # Need to load the app in that case and let routing take place like normal on the hash fragment
  def hash_app
    render '/home/app'
  end

  ##
  # Handles logged out - static landing page
  #         logged in - js app
  #         iso rolls - static page with iframe of app
  #                     XXX want to move this out of here with smart routing in routes.rb
  #         fb genius - renders js app w fb flavor
  #
  def index

    respond_to do |format|
      # this is the catch-all route to redirect unknown routes to our app root, but it's
      # only meant to handle requests for html pages
      format.html {

        @mobile_os = detect_mobile_os
        # redirect to mobile web if on amazon platform
        if @mobile_os == :amazon
          redirect_to('/amazonapp' ) and return
        elsif (@mobile_os == :windows) and !user_signed_in?
          redirect_to('/get-started' ) and return
        end

        #XXX .TV subdomains
        # This is such a hack.  I'd like to detect this in routes.rb and handle by sending to another
        # controller, but until that's built, we just short-circuit right here
        if dot_tv_roll = get_dot_tv_roll_from_domain(request)
          user = Shelby::API.get_user(dot_tv_roll['creator_id'])
          frame_id = get_frame_from_path(params[:path])

          unless frame_id
            # if no frame was specified, this points to the user's roll, which is now at the user's "profile", shelby.tv/the-users-nickname
            redirect_to "#{Settings::Application.protocol_matching_url}/#{user['nickname']}", :status => :moved_permanently and return
          else
            # if a frame was specified this is a link to a specific frame on the user's roll
            redirect_to "#{Settings::Application.protocol_matching_url}/roll/#{dot_tv_roll['id']}/frame/#{frame_id}", :status => :moved_permanently and return
          end
        end

        path = params[:path]
        # if the path is just a user name, this is the route for a user profile, so get the
        # necessary view instance variables and render
        if path && !Settings::Application.root_paths.include?(path) && !path.include?('/')
          user = Shelby::API.get_user(path)

          if user
            @user = user
            @roll = Shelby::API.get_roll_with_frames(@user['personal_roll_id'], '') if @user
            render '/home/app' and return
          else
            raise ActionController::RoutingError.new("Not Found")
          end
        end

        if user_signed_in?
          render '/home/app'
        else
          # Consider errors and render landing page
          @auth_failure  = params[:auth_failure] == '1'
          @auth_strategy = params[:auth_strategy]
          @access_error  = params[:access] == "nos"
          @invite_error  = params[:invite] == "invalid"
          @status = params[:status]
          @mobile_os     = detect_mobile_os
          @is_mobile     = is_mobile?


          if flash[:user_errors]
            @user_attributes = flash[:user_attributes]
            @email_error = flash[:user_errors_email]
            @nickname_error = flash[:user_errors_nickname]
          end

          view_context.get_info_for_meta_tags(params[:path])

          # if @mobile_os
          #   render '/mobile/search', :layout => 'mobile'
          # else

          # A/B tests
          #@landing_messaging_v2 = ab_test :landing_messaging_v2
          #@signup_on_landing = ab_test :signup_on_landing
          #@signup_w_fb = ab_test :signup_w_fb
          #@onboarding_first_step = ab_test :onboarding_first_step

          render '/home/landing'
        end

      }
      # if we hit this as the catch-all while looking for an image or some other special format,
      # we can't render anything appropriate so send a 404
      format.any {
        head :not_found
      }
    end
  end

  ##
  # Handles team page
  #
  # GET /team
  #
  def team
    @team = :true
    render '/home/landing'
  end

  ##
  # Handles community view when visited directly (allowing logged-out users to see it)
  #
  # GET /community
  #
  def community
    render '/home/app'
  end

  ##
  # Handles featured view when visited directly (allowing logged-out users to see it)
  #
  # GET /featured
  # GET /explore
  #
  def featured
    render '/home/app'
  end
  def explore
    render '/home/app'
  end


  ##
  # Handles channels view when visited directly (allowing logged-out users to see it)
  #
  # GET /channels
  #
  def channels
    render '/home/app'
  end

  ##
  # Handles search view when visited directly (allowing logged-out users to see it)
  #
  # GET /search
  #
  def search
    # TODO: uncomment when we have html and js to implement the test variants
    # unless user_signed_in?
    #   # A/B test - only for anonymous users
    #   @search_landing_banner_appear = ab_test :search_landing_banner_appear
    # end
    render '/home/app'
  end

  ##
  # Handles channel view when visited directly (allowing logged-out users to see it)
  #
  # GET /channel/:name
  #
  def channel
    render '/home/app'
  end

  # Static page of information
  def learn_more
  end

  ##
  # Login has its own page for touch devices, like buggy ios7 tablets.
  #
  # GET /log_in
  #
  def log_in
    check_for_signed_in_user_and_issues

    (redirect_to "/" and return) if user_signed_in?

    @login = :true

    @auth_failure  = params[:auth_failure] == '1'
    @auth_strategy = params[:auth_strategy]

    @mobile_os     = detect_mobile_os
    @is_mobile     = is_mobile?

    @redirect_loc = params[:redir] if params[:redir]

    render  '/home/landing'
  end

  # Static page with stats on a users recent activity
  def stats
    # lookup user + stats via api
    if user_signed_in? and request.headers['HTTP_COOKIE'] and @user = Shelby::API.get_user(params['user_id'])
      @frames = Shelby::API.get_user_stats(params['user_id'], req0uest.headers['HTTP_COOKIE'])
    end
  end

  ##
  # Handles shares view when visited directly (allowing logged-out users to see it)
  #
  # GET /:user_name/shares(/:frame_id)
  #
  def shares

    user_id_or_nickname = params[:user_id_or_nickname]
    @user = Shelby::API.get_user(user_id_or_nickname)

    @user_signed_in = user_signed_in?

    @signed_in_user = check_for_signed_in_user
    @signed_in_user_nickname = (@signed_in_user['nickname'] if @signed_in_user) || 'Anonymous'

    if params[:frame_id]
      raise Shelby::InternalError.new("Frame Not Found") unless @frame = Shelby::API.get_frame(params[:frame_id], true)
      @roll = @frame['roll']
      @video = @frame['video']

      @is_mobile = is_mobile?

      if request.env['HTTP_REFERER']
        ref = request.env['HTTP_REFERER']
        @has_referer = ref.match(/twitter|facebook|t.co/)
      end

      render '/home/shares'
    else
      render '/home/app'
    end
  end

  ##
  # Handles one-click unsubscribe from emails
  #
  # GET /preferences/email/unsubscribe?type={weekly-email}
  #
  def unsubscribe
    @user_signed_in = user_signed_in?
    @signed_in_user = check_for_signed_in_user
    @is_mobile = is_mobile?
    @unsubscribe_type = params[:type]
    if @user_signed_in and @signed_in_user and (@unsubscribe_type == "weekly-email") and (preferences = @signed_in_user['preferences'])
      preferences['email_updates'] = false
      EM.next_tick { update_user(@signed_in_user, {:preferences=>preferences}) }
    end
  end

  def blitz
    render :text => "42"
  end

  ##
  # Handles "make the web" (allowing logged-out users to see it)
  #
  # GET /experience/:url
  #
  def experience
    urls = ["http://www.reddit.com/r/videos",
            "http://www.reddit.com/domain/hulu.com",
            "http://laughingsquid.com",
            "http://vimeo.com/channels/documentaryfilm",
            "http://vimeo.com/channels/7588",
            "http://vimeo.com/channels/worldhd",
            "http://mashable.com/2012/07/12/funny-youtube-videos-reddit/",
            "http://youtube-global.blogspot.com/",
            "http://periodicvideos.blogspot.com/",
            "http://youtube-trends.blogspot.com/"
          ]
    @url = params[:q] ? params[:q] : urls[rand(urls.length)]
    render '/home/experience'
  end

  ##
  # GT API Server sets the appropriate cookie to let us know the user is signed out
  #  in case something went wrong somewhere over the wire, it is not being set here.
  #
  def signout
    flash[:error] = params[:error]

    # def dont want this around (API tries to kill it, too)
    cookies.delete(:_shelby_gt_common, :domain => '.shelby.tv')

    redirect_to Settings::ShelbyAPI.url + "/sign_out_user"
  end

  def login
    @mobile_os     = detect_mobile_os
    @is_mobile     = is_mobile?
    @session_error = params[:status]

    cookies.delete(:_shelby_gt_common, :domain => ".shelby.tv")

    if flash[:user_errors]
      @user_attributes = flash[:user_attributes]
      @email_error     = flash[:user_errors_email]
      @nickname_error  = flash[:user_errors_nickname]
    end
  end

  def ipadbeta
    @mobile_os =  detect_mobile_os
    @is_mobile =  is_mobile?
    @ipadbeta  = true

    @optin    = params.delete(:optin) == 'true' ? true : false
    @ga_label = params.delete(:email)

    render 'home/landing'
  end

  def amazonapp
    respond_to do |format|
      format.json {
        manifest = {
          "verification_key" => "562513e4-f6d1-4a4d-a7fc-828814946ea8",
          "version" => "1.0(0)",
          "launch_path" => "amazonapp?mobile=false",
          "type" => "web",
          "permissions" => [
            "auth"
          ],
          "last_update"  => "2014-01-22 12:00:21+0000"
        }

        render :json => manifest.to_json
      }
    end
  end

  def bookmarklet
    if session[:found_video_providers]
      @found_video_providers = session[:found_video_providers]
      session.delete(:found_video_providers)
    else
      # match params to support providers, if we have at least 1 provider name in the params then we have at least 1 video.
      @found_video_providers = params.keep_if { |provider_name| Settings::Radar.video_providers.include?(provider_name) }
    end

    render and return if @found_video_providers.empty?

    # @user_signed_in = user_signed_in?
    # @signed_in_user = check_for_signed_in_user

    check_for_signed_in_user_and_issues

    if !user_signed_in?
      session[:found_video_providers] = @found_video_providers
      render(:layout => 'radar', :template => 'radar/index') and return
    else
      unless @found_video_providers.empty?

        @videos = []

        @found_video_providers.each do |provider_name, provider_ids|
          # dont look at shit we dont support
          next unless Settings::Radar.video_providers.include?(provider_name)

          provider_ids = @found_video_providers[provider_name]
          provider_ids.each do |provider_id|
            if video = Shelby::API.find_or_create_video(provider_name, provider_id)
              # adding these because the find_or_create route doesn't add them :(
              video['provider_name'] = provider_name
              video['provider_id'] = provider_id
              #####
              @videos << video unless video.nil?
            end
          end
        end

        @videos.reverse!

        render(:layout => 'radar', :template => 'radar/index') and return
      end
    end

  end

  def get_started

    render '/home/get-started'
  end

  private

    def get_dot_tv_roll_from_domain(request)
      hard_coded_dot_tv_roll_id =
        case request.host
          #TODO: pull this mapping from API
          when "bohrmann.tv" then "4f8f81bbb415cc4762002d7a"
          when "chriskurdziel.tv" then "4f901d4bb415cc661405fde9"
          when "danspinosa.tv" then "4f8f7ef2b415cc4762000002"
          when "fredwilson.tv" then "4f8f7fb0b415cc4762000c42"
          when "henrysztul.tv" then "4f8f7ef6b415cc476200004a"
          when "hipstersounds.tv" then "4fa03429b415cc18bf0007b2"
          when "laughingsquid.tv" then "4fc637879a725b755d001f77"
          when "nerdfitness.tv" then "4fdee5f91c1cf4714200a607"
          when "nowplaying.shelby.tv" then "4fcd0ca888ba6b07e30001d7"
          when "reecepacheco.tv" then "4f900d56b415cc6614056681"
          when "syria.shelby.tv" then "4fccffc188ba6b7a82000b92"
          when "trololo.shelby.tv" then "4fccc6e4b415cc7f2100092d"
          when "yvynyl.tv" then "4fa2908088ba6b61770010af"
          when "nextlevelguy.tv" then "50d4f19ab415cc3807015105"    # requested via NF.tv, added 01/07/13 -hs
          when "missouriquiltco.tv" then "51190f1eb415cc77f308eb22" # requested via Al Doan, added 02/10/13 -hs
          when "mobilona.tv" then "511a6296b415cc12d0057dcf"        # requested by Julie, added 2/14/13 -ds
          when "theadventurous.tv" then "511a62d4b415cc06c70a771b"  # requested by J.McFaddan, added 2/18/13 -hs
          when "journeyful.tv" then "5114657bb415cc1ded5a399c" # requested by Moe I., added 3/7/13 -hs
          when "chipsahoy.tv" then "513f4964b415cc143a00ec8b"
          when "shannononeil.tv" then "51140d6db415cc1ded44830e" # requested by jamie@tierra-innovation.com, added 3/7/13 -hs
          when "runneracademy.tv" then "508ed234b415cc50e40112bb" # requested by matt j., added 3/7/13 -hs
          when "localhost.danspinosa.tv" then "4f8f7ef2b415cc4762000002"
          when "localhost.henrysztul.tv" then "4f8f7ef6b415cc476200004a"
          else nil
        end

      if hard_coded_dot_tv_roll_id
        Shelby::API.get_roll(hard_coded_dot_tv_roll_id)
      elsif [nil, "", "gt", "localhost", "www", "fb", "m"].include? request.subdomain
        nil
      elsif ActionDispatch::Http::URL.extract_domain(request.host) == "shelby.tv"
        # for shelby.tv domain, try to find a roll assigned to the given subdomain
        Shelby::API.get_roll_by_subdomain(request.subdomain)
      else
        nil
      end
    end

    def get_genius_roll_id_from_path(path)
      return @roll_id[1] if @roll_id = /fb\/genius\/roll\/(\w*)/i.match(path)
    end

    def get_frame_from_path(path)
       frame_id = /(\w*)/.match(params[:path])
       frame_id[1] if frame_id and BSON::ObjectId.legal?(frame_id[1])
    end

    def get_account_analytics_info(user)
      if user
        abilities = user["additional_abilities"]
        abilities.keep_if {|a| a[0..2] == "UA-"}
        return abilities.first if !abilities.empty?
      end
      return Settings::GoogleAnalytics.code
    end

end
