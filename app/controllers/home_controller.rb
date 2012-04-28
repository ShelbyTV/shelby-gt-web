require 'shelby_api'

class HomeController < ApplicationController

  ##
  # If the request is made to a particular frame, then we should display the appropriate metatags
  #  (primarily for fb og, but also for any other bots)
  #TODO: If the request is made to a roll, also display some meta tags
  def index
    if path_match = /roll\/\w*\/frame\/(\w*)/.match(params[:path])
      frame_id = path_match[1]
      @video_info = Shelby::API.get_video_info(frame_id)
      @video_embed = @video_info['video']['embed_url']
      @permalink = Shelby::API.generate_route(@video_info['frame']['roll_id'], frame_id) if @video_info
    elsif path_match = /roll\/(\w*)(\/.*)*/.match(params[:path])
      roll_id = path_match[1]
      @video_info = Shelby::API.get_first_frame_on_roll(roll_id)
      @video_embed = @video_info['video']['embed_url']
      @permalink = Shelby::API.generate_route(@video_info['frame']['roll_id'], @video_info['frame']['id']) if @video_info
    else
      @roll_info = nil
      @video_info = nil
    end
    
    if user_signed_in?
      @csrf_token = csrf_token_from_cookie
      render 'app'
    else
      @show_error = params[:access] == "nos"
      @gt_enabled_redirect = params[:access] == "gt"
      if params[:gt_access_token]
        @has_access_token = true
        cookies[:gt_access_token] = {:value => params[:gt_access_token], :domain => ".shelby.tv"}
      end
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
