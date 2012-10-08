require 'shelby_api'

class HomeController < ApplicationController

  ##
  # Handles logged out - static landing page
  #         logged in - js app
  #         iso rolls - static page with iframe of app
  #                     XXX want to move this out of here with smart routing in routes.rb
  #
  def index

    respond_to do |format|
      # this is the catch-all route to redirect unknown routes to our app root, but it's
      # only meant to handle requests for html pages
      format.html {
        #XXX ISOLATED_ROLL
        # This is such a hack.  I'd like to detect this in routes.rb and handle by sending to another
        # controller, but until that's built, we just short-circuit right here
        if @isolated_roll_id = get_isolated_roll_id_from_domain_of_request(request)
          @roll = Shelby::API.get_roll(@isolated_roll_id)
          @user = Shelby::API.get_user(@roll['creator_id']) if @roll
          
          @frame_id = get_frame_from_path(params[:path])
          render '/home/isolated_roll' and return
        end

        if user_signed_in?
          render '/home/app'

        else
          # Consider errors and render landing page
          @auth_failure = params[:auth_failure] == '1'
          @auth_strategy = params[:auth_strategy]
          @show_error = params[:access] == "nos"
          @mobile_os = detect_mobile_os
          
          get_info_for_meta_tags(params[:path])
          
          if @mobile_os
            render '/mobile/search', :layout => 'mobile'
          else
            render '/home/landing'
          end

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
  # Handles explore view when visited directly (allowing logged-out users to see it)
  #
  # GET /explore
  #
  def explore
    render '/home/app'
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


    def get_isolated_roll_id_from_domain_of_request(request)
      return case request.host
          #TODO: pull this mapping from API
          when "fredwilson.tv" then "4f8f7fb0b415cc4762000c42"
          when "danspinosa.tv" then "4f8f7ef2b415cc4762000002"
          when "henrysztul.tv" then "4f8f7ef6b415cc476200004a"
          when "laughingsquid.tv" then "4fc637879a725b755d001f77"
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
            if [nil, "", "gt", "localhost", "www", "fb"].include? request.subdomain
              false
            elsif ActionDispatch::Http::URL.extract_domain(request.host) == "shelby.tv"
              # for shelby.tv domain, try to find a roll assigned to the given subdomain
              roll = Shelby::API.get_roll(request.subdomain)
              
              roll && roll['id']
            else
              false
            end
      end
    end
    
    def get_info_for_meta_tags(path)
      if path_match = /roll\/\w*\/frame\/(\w*)/.match(path)
        # the url is a frame
        @frame = Shelby::API.get_first_frame_on_roll(path_match[1])
        @video = Shelby::API.get_video() if @frame
      elsif path_match = /roll\/(\w*)(\/.*)*/.match(path) or path_match = /user\/(\w*)\/personal_roll/.match(path)
        # the url is a roll or personal roll
        @roll = Shelby::API.get_roll(path_match[1])
        @user = Shelby::API.get_user(@roll['creator_id']) if @roll
      end
    end
    
    def get_frame_from_path(path)
       frame_id = /(\w*)/.match(params[:path])
       frame_id[1] if frame_id and BSON::ObjectId.legal?(frame_id[1])
    end

end
