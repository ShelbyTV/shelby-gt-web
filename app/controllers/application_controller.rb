class ApplicationController < ActionController::Base
  protect_from_forgery
  
  ##
  # Simple helper to let us know if user is signed in
  #
  def user_signed_in?
    cookies[:locked_and_loaded] == "true"
  end
  
end
