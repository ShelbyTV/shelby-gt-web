require 'shelby_api'

class HomeController < ApplicationController

  ##
  # If the request is made to a particular frame, then we should display the appropriate metatags
  #  (primarily for fb og, but also for any other bots)
  def index

    # Get video and user info from shelby api for meta tags
    @meta_info = get_api_info(params[:path])
    @provider_name = @meta_info[:video_info] && @meta_info[:video_info]['video'] && @meta_info[:video_info]['video']['provider_name']
    
    # Get parameters associated with omniauth failure
    @auth_failure = params[:auth_failure] == '1'
    @auth_strategy = params[:auth_strategy]
    
    #XXX ISOLATED_ROLL
    if @isolated_roll_id = is_isolated_roll?(request)
      @meta_info = get_api_info("/roll/#{@isolated_roll_id}")
      render 'isolated_roll' and return 
    end
    
    #XXX ISOLATED_ROLL - HACKING allowing viewing
    if user_signed_in? or /isolated_roll\//.match(params[:path])
      @csrf_token = csrf_token_from_cookie
      @rhombus_token = 'Basic '+Base64.strict_encode64('shelby:_rhombus_gt')
      render 'app'
    else
      @show_error = params[:access] == "nos"
      @gt_enabled_redirect = params[:access] == "gt"
      if params[:gt_access_token]
        @has_access_token = true
        cookies[:gt_access_token] = {:value => params[:gt_access_token], :domain => ".shelby.tv"}
      end
      
      # Get parameters associated with sharing
      if params[:utm_campaign] == "email-share"
        @email_share = {:name => URI.unescape(params[:utm_source]), :avatar => URI.unescape(params[:utm_medium])}
      elsif params[:genius]
        @genius_share = true
      end
      #XXX Mobile
      return render_mobile_view(params) if is_mobile?(request)
      
      render 'gate'
    end
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
  
  def get_bookmarklet
    render 'get_bookmarklet', :layout => 'blank'
  end
  
  private
    
    def is_mobile?(request)
      request.env["HTTP_USER_AGENT"] && request.env["HTTP_USER_AGENT"][/(iPhone|iPod|iPad|Android)/]
    end
    
    def is_iphone?(request)
      (request.user_agent=~/iPhone/) != nil
    end
    
    def is_android?(request)
      (request.user_agent=~/Andoid/) != nil
    end
    
    def render_mobile_view(params)
      
      if frame_id = /frame\/(\w*)/.match(params[:path]) and frame_id[1] and @frame = Shelby::API.get_frame_info(frame_id[1], true)
        
        render 'mobile/frame', :layout => "mobile"
      else
        # TODO: this should really be some mobile optimized splash page with a link to the search page?
        render 'mobile/search', :layout => "mobile"
      end
      
    end
    
    def is_isolated_roll?(request)
      @isolated_roll_id = case request.host
          #TODO: pull this mapping from API
          when "danspinosa.tv" then "4f8f7ef2b415cc4762000002"
          when "henrysztul.tv" then "4f8f7ef6b415cc476200004a"
          when "laughingsquid.tv" then "4fa28d309a725b77f700070f"
          when "hipstersounds.tv" then "4fa03429b415cc18bf0007b2"
          when "reecepacheco.tv" then "4f900d56b415cc6614056681"
          when "tedtalks.tv" then "4fbaa51d1c1cf44b9d002f58"
          when "chriskurdziel.tv" then "4f901d4bb415cc661405fde9"
          when "bohrmann.tv" then "4f8f81bbb415cc4762002d7a"
          when "trololo.shelby.tv" then "4fccc6e4b415cc7f2100092d"
          when "syria.shelby.tv" then "4fccffc188ba6b7a82000b92"
          when "nowplaying.shelby.tv" then "4fcd0ca888ba6b07e30001d7"
          when "wallstreetjournal.tv" then "4fa8542c88ba6b669b000bcd"
          when "localhost.hipstersounds.tv" then "4fa03429b415cc18bf0007b2"
          when "localhost.danspinosa.tv" then "4f8f7ef2b415cc4762000002"
          when "localhost.henrysztul.tv" then "4f8f7ef6b415cc476200004a"
          else
            if [nil, "", "gt", "localhost", "www"].include? request.subdomain
              false
            elsif ActionDispatch::Http::URL.extract_domain(request.host) == "shelby.tv"
              # for shelby.tv domain, try to find a roll assigned to the given subdomain
              response = Shelby::API.get_roll(request.subdomain)
              response['status'] == 200 && response['result'] && response['result']['id']
            else
              false
            end
      end
    end

end
