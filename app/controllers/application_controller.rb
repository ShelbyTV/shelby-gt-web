require 'shelby_api'
require 'cookie_utils'
require 'hash_error_checker'
require 'shelby/internal_error'


class ApplicationController < ActionController::Base
  include ApplicationHelper

  protect_from_forgery

  after_filter :set_access_control_headers

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
    request.env["HTTP_USER_AGENT"] && request.env["HTTP_USER_AGENT"][/(iPhone|iPod|Android|Kindle|Silk)/]
  end

  def detect_mobile_os
    if params[:amazon] == "true"
      session[:amazon] = true
    end

    return :windows if (request.user_agent=~/MSAppHost/)
    return :ios if (request.user_agent=~/iPhone/)
    return :amazon if (session[:amazon])
    return :amazon if (request.user_agent=~/AmazonWebAppPlatform/)
    return :android if (request.user_agent=~/Android/)
    return :tablet if (request.user_agent=~/Silk/)
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

  def check_for_signed_in_user_and_issues(options={})
    @signed_in_user = check_for_signed_in_user
    @user_signed_in = user_signed_in?
    @is_mobile      = is_mobile?
    @mobile_os      = detect_mobile_os

    if @signed_in_user and @signed_in_user['user_type'] == Settings::User.user_type.anonymous and !@user_signed_in
      # login and redirect to /stream
      r = Shelby::API.login(@signed_in_user['nickname'], 'anonymous', request.headers['HTTP_COOKIE'])
      Shelby::CookieUtils.proxy_cookies(options[:cookies], r.headers['set-cookie'])
      redirect_to(appropriate_subdirectory+"/stream") and return
    end

    # redirect if told to via options
    if options[:redirect_if_issue] and @signed_in_user and @signed_in_user['app_progress'].nil?
      cookies.delete(:_shelby_gt_common, :domain => '.shelby.tv')
      redirect_to(appropriate_subdirectory+"/?msg=Eeek,%20Something%20went%20wrong.%20Try%20logging%20in%20again.&status=401") and return

    # just reset user state as seen by app
    elsif @signed_in_user and (@signed_in_user['user_type'] != Settings::User.user_type[:anonymous]) and @signed_in_user['app_progress'].nil?
      cookies.delete(:_shelby_gt_common, :domain => '.shelby.tv')
      @signed_in_user = check_for_signed_in_user
      @user_signed_in = user_signed_in?
    elsif @user_signed_in and (@signed_in_user['user_type'] != Settings::User.user_type[:anonymous]) and (@signed_in_user['nickname'] == "Anonymous")
      cookies.delete(:_shelby_gt_common, :domain => '.shelby.tv')
      @signed_in_user = check_for_signed_in_user
      @user_signed_in = user_signed_in?
    end
  end

  private

    # Allowing simple GET requests cross-origin
    # This is not CORS
    def set_access_control_headers
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Request-Method'] = 'GET'
    end

  if Rails.env.production?
    rescue_from ActionController::RoutingError, :with => :render_error_404
    rescue_from ActionView::Template::Error, :with => :render_error_500
    rescue_from Shelby::InternalError, :with => :render_error_500
  end

  def render_error_404
    error('404 Page Not Found')
  end

  def render_error_500
    error('404 Page Not Found')
  end

  def error(status)
    render '/errors/error', :layout => 'blank', :locals => {
      :status => status,
      :message => Settings::ErrorMessages.messages.sample
    }, :status => 404
  end
end

