require 'shelby_api'

class ApplicationController < ActionController::Base
  before_filter :setup_rhombus_auth
  protect_from_forgery

  def setup_rhombus_auth
    puts 'SETTING UP RHOMBUS'
    cookies[:_rhombus_auth] = Base64.encode64('shelby_rhombus')
  end
  
  ##
  # Simple helper to let us know if user is signed in:
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
  
  def get_video_info(path)
    roll_info, video_info, user_info, permalink = nil
    
    if path_match = /roll\/\w*\/frame\/(\w*)/.match(path)
      frame_id = path_match[1]
      video_info = Shelby::API.get_video_info(frame_id)
      if video_info
        video_embed = video_info['video']['embed_url']
        permalink = Shelby::API.generate_frame_route(video_info['frame']['roll_id'], frame_id)
      end
    elsif path_match = /roll\/(\w*)(\/.*)*/.match(path)
      roll_id = path_match[1]
      video_info = Shelby::API.get_first_frame_on_roll(roll_id)
      if video_info
        video_embed = video_info['video']['embed_url']
        permalink = Shelby::API.generate_frame_route(video_info['frame']['roll_id'], video_info['frame']['id'])
      end
    elsif path_match = /user\/(\w*)\/personal_roll/.match(path)
      user_nickname = path_match[1]
      user_info = Shelby::API.get_user_info(user_nickname)
      permalink = Shelby::API.generate_user_route(user_nickname)
    end
    
    info = {
      :video_info =>  video_info,
      :video_embed => video_embed,
      :user_info =>   user_info,
      :permalink =>   permalink
    }
    
    return info
  end
  
end
