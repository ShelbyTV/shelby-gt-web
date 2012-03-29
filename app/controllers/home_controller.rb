class HomeController < ApplicationController

  ##
  # We need to show the login page on the root path if the user IS NOT signed in
  # We need to show the app page on the root path if the user IS signed in   ***AND***
  #  when the user IS NOT signed in BUT should see 'non-logged in shelby'
  #
  def index
    if !user_signed_in? and request.fullpath == '/'
      render 'login'
    else
      render 'app'
    end
  end  
  
  ##
  # GT API Server sets the appropriate cookie to let us know the user is signed out
  #  in case something went wrong somewhere over the wire, it is not being set here.
  #
  def signout
    # api.shelby.tv/sign_out_user will delete the hint cookie, but can't access it during dev (since the cookies domain is localhost)
    cookies.delete(:locked_and_loaded) if Rails.env == "development"
    redirect_to Settings::ShelbyAPI.url + "/sign_out_user"
  end

end
