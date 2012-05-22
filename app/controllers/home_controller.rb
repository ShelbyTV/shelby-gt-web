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
      if @video_info
        @video_embed = @video_info['video']['embed_url']
        @permalink = Shelby::API.generate_route(@video_info['frame']['roll_id'], frame_id)
      else
        @video_embed = nil
        @permalink = nil
      end
=begin
    elsif path_match = /roll\/(\w*)(\/.*)*/.match(params[:path])
      roll_id = path_match[1]
      @video_info = Shelby::API.get_first_frame_on_roll(roll_id)
      if @video_info
        @video_embed = @video_info['video']['embed_url']
        @permalink = Shelby::API.generate_route(@video_info['frame']['roll_id'], @video_info['frame']['id']) if @video_info
      end
=end
    else
      @roll_info = nil
      @video_info = nil
    end
    
    #XXX ISOLATED_ROLL - HACKING MAPPING based on domain
    #TODO: pull this mapping from API
    @isolated_roll_id = case request.host
      when "danspinosa.tv" then "4f8f7ef2b415cc4762000002"
      when "henrysztul.tv" then "4f8f7ef6b415cc476200004a"
      when "laughingsquid.tv" then "4fa28d309a725b77f700070f"
      when "hipstersounds.tv" then "4fa03429b415cc18bf0007b2"
      when "reecepacheco.tv" then "4f900d56b415cc6614056681"
      when "localhost.hipstersounds.tv" then "4fa03429b415cc18bf0007b2"
      when "localhost.danspinosa.tv" then "4f8f7ef2b415cc4762000002"
      when "localhost.henrysztul.tv" then "4f8f7ef6b415cc476200004a"
      else false
    end
    render 'isolated_roll' and return if @isolated_roll_id
    #TODO: need to make sure we render stuff for SEO on the isolated_roll page

    #XXX ISOLATED_ROLL - HACKING allowing viewing
    if user_signed_in? or /isolated_roll\//.match(params[:path])
      @csrf_token = csrf_token_from_cookie      
      render 'app'
    else
      @show_error = params[:access] == "nos"
      @gt_enabled_redirect = params[:access] == "gt"
      if params[:gt_access_token]
        @has_access_token = true
        cookies[:gt_access_token] = {:value => params[:gt_access_token], :domain => ".shelby.tv"}
      elsif params[:gt_ref_uid] and params[:gt_ref_email] and params[:gt_ref_roll]
        @has_access_token = true
        val = "#{params[:gt_ref_uid]},#{params[:gt_ref_email]},#{params[:gt_ref_roll]}"
        cookies[:gt_roll_invite] = {:value => val, :domain => ".shelby.tv"}
      end
      render 'gate'
    end
  end  
  
  ##
  # GT API Server sets the appropriate cookie to let us know the user is signed out
  #  in case something went wrong somewhere over the wire, it is not being set here.
  #
  def signout
    flash[:error] = params[:error]
    redirect_to Settings::ShelbyAPI.url + "/sign_out_user"
  end

end
