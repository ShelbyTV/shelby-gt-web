require 'shelby_api'

class HomeController < ApplicationController

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

        # if the path is just a user name, this is the route for a user profile, so get the
        # necessary view instance variables and continue
        user_name = params[:path]
        user = Shelby::API.get_user(user_name) if user_name

        if user
          @user = user
          @roll = Shelby::API.get_roll_with_frames(@user['personal_roll_id']) if @user

          render '/home/app' and return
        end

        if user_signed_in?
          render '/home/app'
        else
          # Consider errors and render landing page
          @auth_failure  = params[:auth_failure] == '1'
          @auth_strategy = params[:auth_strategy]
          @access_error  = params[:access] == "nos"
          @invite_error  = params[:invite] == "invalid"
          @mobile_os     = detect_mobile_os
          @is_mobile     = is_mobile?

          view_context.get_info_for_meta_tags(params[:path])

          # if @mobile_os
          #   render '/mobile/search', :layout => 'mobile'
          # else
          # A/B test
          @seo_search_messaging = ab_test :seo_search_messaging

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
  # Handles invite landing page
  #
  # GET /invite/:invite_id
  #     :invite_id is OPTIONAL and used for invitation system in app
  #
  def invite
    if user_signed_in?
      redirect_to :action => :index
    else
      @sign_up = true
      @invite_id = params[:invite_id]

      # Parse errors and render landing

      @nickname_error = params[:nickname]
      @email_error = params[:primary_email]

      render '/home/landing'
    end
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

  # Static page with stats on a users recent activity
  def stats
    # lookup user + stats via api
    if user_signed_in? and request.headers['HTTP_COOKIE'] and @user = Shelby::API.get_user(params['user_id'])
      @frames = Shelby::API.get_user_stats(params['user_id'], request.headers['HTTP_COOKIE'])
    end
  end

  ##
  # Handles shares view when visited directly (allowing logged-out users to see it)
  #
  # GET /:user_name/shares(/:frame_id)
  #
  def shares
    user_name = params[:user_name]
    user = Shelby::API.get_user(user_name)
    if user
      @user = user
      @roll = Shelby::API.get_roll_with_frames(@user['personal_roll_id']) if @user
    end
    @frame = Shelby::API.get_frame(params[:frame_id], true) if params[:frame_id]
    @video = @frame['video'] if @frame

    render '/home/app'
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
    cookies.delete(:_shelby_gt_common)

    redirect_to Settings::ShelbyAPI.url + "/sign_out_user"
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
