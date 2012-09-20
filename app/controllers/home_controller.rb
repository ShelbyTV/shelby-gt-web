require 'shelby_api'

class HomeController < ApplicationController

  ##
  # Handles logged out - static landing page
  #         logged in - js app 
  #         iso rolls - static page with iframe of app
  #                     XXX want to move this out of here with smart routing in routes.rb
  #
  def index
    
    #XXX FB GENIOUS ROLL
    if @genius_roll_id = get_genius_roll_id_from_path(params[:path])
      render '/home/app' and return
    end
    
    #XXX ISOLATED_ROLL
    # This is such a hack.  I'd like to detect this in routes.rb and handle by sending to another
    # controller, but until that's built, we just short-circuit right here
    if @isolated_roll_id = get_isolated_roll_id_from_request(request)
      render '/home/isolated_roll' and return 
    end
    
    if user_signed_in?
      set_app_tokens_for_view
      render '/home/app'
    
    else
      # Consider errors and render landing page
      @auth_failure = params[:auth_failure] == '1'
      @auth_strategy = params[:auth_strategy]
      @show_error = params[:access] == "nos"
      @mobile_os = detect_mobile_os
      
      render (@mobile_os ? '/mobile/search' : '/home/landing')
      
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
  
  #####
  # main search/home page for fb genius app
  #
  def facebook_genius_index
    if param[:signed_request]
      koala = Koala::Facebook::OAuth.new('305135322927840','b616125302256c0dc06654cdd4bdf9bc')
      @un_signed_request = koala.parse_signed_request(params[:signed_request])
    end
    render '/home/facebook_genius/index'
  end

  private

    
    def get_isolated_roll_id_from_request(request)
      return case request.host
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
    
    def get_genius_roll_id_from_path(path)
      return @roll_id[1] if @roll_id = /fb_genius\/roll\/(\w*)/i.match(path)
    end
    
    def is_from_fb_genius_frame_share(path)
      /fb_genius\/roll\/(\w*)\/frame\/(\w*)/i.match(path)
    end
    
end
