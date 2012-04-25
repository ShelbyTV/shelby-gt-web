class ApplicationController < ActionController::Base
  protect_from_forgery
  
  ##
  # Simple helper to let us know if user is signed in:
  #  the _shelby_gt_common cookie is being set/cleared on the api server
  def user_signed_in?
    if cookie = cookies[:_shelby_gt_common]
      cookie.split("=")[1] == "nil" ? false : true
    else
      false
    end
  end
  
  def csrf_token_from_cookie
    if c = cookies[:_shelby_gt_common].split(',')[1]
      csrf_token = c[(c.index("=") + 1)..-1]
    else
      csrf_token = nil
    end
  end
  
end
