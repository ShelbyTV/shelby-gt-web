class ApplicationController < ActionController::Base
  protect_from_forgery
  
  ##
  # Simple helper to let us know if user is signed in:
  #  the _shelby_gt_common cookie is being set/cleared on the api server
  def user_signed_in?
    !!cookie_to_hash(cookies[:_shelby_gt_common])[:authenticated_user_id]
  end
  
  def csrf_token_from_cookie
    cookie_to_hash(cookies[:_shelby_gt_common])[:csrf_token]
  end
  
  def cookie_to_hash(c, delim=",", split="=")
    entries = c.blank? ? nil : c.split(delim)
    h = {}
    return h if entries.blank?
    
    entries.each do |entry|
      key, val = entry.split("=", 2)
      h[key.to_sym] = val
    end
    
    h
  end
  
end
