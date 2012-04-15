class HomeController < ApplicationController

  ##
  # We need to show the login page on the root path if the user IS NOT signed in
  # We need to show the app page on the root path if the user IS signed in   ***AND***
  #  when the user IS NOT signed in BUT should see 'non-logged in shelby'
  #
  def index
    #TODO: build me!
    if frame_id = /roll\/\w*\/frame\/(\w*)/.match(request.fullpath)
      @meta_info = Shelby::API.get_video_info(frame_id)
      @permalink = Shelby::API.generate_route(@meta_info[:frame]['roll_id'], frame_id)
    else
      @meta_info = nil
    end
    render 'app'
  end  
  
  ##
  # GT API Server sets the appropriate cookie to let us know the user is signed out
  #  in case something went wrong somewhere over the wire, it is not being set here.
  #
  def signout
    cookies.delete(:signed_in) if Rails.env == "development"
    redirect_to Settings::ShelbyAPI.url + "/sign_out_user"
  end

end
