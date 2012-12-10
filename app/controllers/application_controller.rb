require 'shelby_api'

class ApplicationController < ActionController::Base
  protect_from_forgery
  
  #set Vanity (A/B testing) to use javascript to register participants, hopefully preventing robots from participating
  Vanity.playground.use_js!

  #assign an identity for vanity (A/B testing)
  use_vanity :vanity_id

  def vanity_id
    if (request.env['HTTP_USER_AGENT'] =~ /\b(Baidu|Gigabot|Googlebot|libwww-perl|lwp-trivial|msnbot|SiteUptime|Slurp|WordPress|ZIBB|ZyBorg)\b/i)
      #merge known web-bots to a single id to minimize skewing of test results
      return Struct.new(:id).new("robot")
    else
      id = current_user_id
      if id && id != "nil"
        return Struct.new(:id).new(id.to_s)
      else
        return nil
      end
    end
  end

  helper_method :csrf_token_from_cookie

  def render_error(code, message)
    @status, @message = code, message
    Rails.logger.error "render_error(#{code}, '#{message}')"
    render 'blank', :status => @status, :formats => [:json]
  end
  
  # Mobile detection
  def is_mobile?
    request.env["HTTP_USER_AGENT"] && request.env["HTTP_USER_AGENT"][/(iPhone|iPod|Android)/]
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
    id = current_user_id
    id ? id != "nil" : false
  end

  def current_user_id
    cookie_to_hash(cookies[:_shelby_gt_common])[:authenticated_user_id]
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
