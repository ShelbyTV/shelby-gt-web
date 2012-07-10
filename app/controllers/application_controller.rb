require 'shelby_api'

class ApplicationController < ActionController::Base
  protect_from_forgery

  def render_error(code, message)
    @status, @message = code, message
    Rails.logger.error "render_error(#{code}, '#{message}')"
    render 'blank', :status => @status, :formats => [:json]
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
  
  def get_api_info(path)
    roll_info, video_info, user_info, roll_permalink, user_permalink, frame_permalink = nil
    
    if path_match = /roll\/\w*\/frame\/(\w*)/.match(path)
    # the url is a frame
      frame_id = path_match[1]
      video_info = Shelby::API.get_video_info(frame_id)
      if video_info and video_info['video'] and video_info['frame']
        video_embed = video_info['video']['embed_url']
        frame_permalink = Shelby::API.generate_frame_route(video_info['frame']['roll_id'], frame_id)
        roll_permalink = Shelby::API.generate_roll_route(video_info['frame']['roll_id'])
      end
      return  { :frame => { :frame_permalink => frame_permalink,
                            :roll_permalink => roll_permalink },
                :video_embed => video_embed,
                :video_info =>  video_info
              }
    elsif path_match = /roll\/(\w*)(\/.*)*/.match(path) or path_match = /user\/(\w*)\/personal_roll/.match(path)
    # the url is a roll or personal roll
      roll_id = path_match[1]
      video_info = Shelby::API.get_first_frame_on_roll(roll_id)
      if video_info
        video_embed = video_info['video']['embed_url'] if video_info['video']
        user_info = Shelby::API.get_user_info(video_info['roll']['creator_id'])
        roll_info = video_info['roll']
        if video_info['frame']
          frame_permalink = Shelby::API.generate_frame_route(video_info['frame']['roll_id'], video_info['frame']['id'])
          roll_permalink = Shelby::API.generate_roll_route(video_info['frame']['roll_id']) 
        end
        user_permalink = Shelby::API.generate_user_route(user_info['nickname']) if user_info
      end
      return {  :roll => {  :roll_info => roll_info,
                            :roll_permalink => roll_permalink,
                            :user_info =>   user_info,
                            :user_permalink =>   user_permalink },
                :video_embed => video_embed,
                :video_info =>  video_info
              }
    else
      return { :video_info => nil }
    end
  end
  
end
