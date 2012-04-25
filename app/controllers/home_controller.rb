require 'shelby_api'

class HomeController < ApplicationController

  ##
  # If the request is made to a particular frame, then we should display the appropriate metatags
  #  (primarily for fb og, but also for any other bots)
  #TODO: If the request is made to a roll, also display some meta tags
  def index
    if frame_id = /roll\/\w*\/frame\/(\w*)/.match(params[:path])
      frame_id = frame_id[1]
      @fb_meta_info = Shelby::API.get_video_info(frame_id)
      @permalink = Shelby::API.generate_route(@fb_meta_info['frame']['roll_id'], frame_id) if @fb_meta_info
    else
      @fb_meta_info = nil
    end
    
    if user_signed_in?
      @csrf_token = csrf_token_from_cookie
      render 'app'
    else
      @show_error = params[:access] == "nos"
      render 'gate'
    end
  end  
  
  ##
  # GT API Server sets the appropriate cookie to let us know the user is signed out
  #  in case something went wrong somewhere over the wire, it is not being set here.
  #
  def signout
    redirect_to Settings::ShelbyAPI.url + "/sign_out_user"
  end

end
