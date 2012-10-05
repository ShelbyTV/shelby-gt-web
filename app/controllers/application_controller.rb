require 'shelby_api'

class ApplicationController < ActionController::Base
  protect_from_forgery
  
  helper_method :csrf_token_from_cookie

  def render_error(code, message)
    @status, @message = code, message
    Rails.logger.error "render_error(#{code}, '#{message}')"
    render 'blank', :status => @status, :formats => [:json]
  end
  
  # Mobile detection
  def is_mobile?
    request.env["HTTP_USER_AGENT"] && request.env["HTTP_USER_AGENT"][/(iPhone|iPod|iPad|Android)/]
  end
  
  def detect_mobile_os
    return :ios if (request.user_agent=~/iPhone/)
    return :android if (request.user_agent=~/Android/)
    return :generic if is_mobile?
    return nil
  end
  
  ##
  # Simple helper to let us know if we expect that the user is signed in:
  #  the _shelby_gt_common cookie is being set/cleared on the api server
  def user_signed_in?
    id = cookie_to_hash(cookies[:_shelby_gt_common])[:authenticated_user_id]
    id ? id != "nil" : false
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
