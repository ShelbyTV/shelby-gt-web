class HomeController < ApplicationController

  ##
  # We need to show the login page on the root path if the user IS NOT signed in
  # We need to show the app page on the root path if the user IS signed in   ***AND***
  #  when the user IS NOT signed in BUT should see 'non-logged in shelby'
  #
  def index
    if !user_signed_in? and request.fullpath == '/'
      #render 'login'
      render 'app'
    else
      render 'app'
    end
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
