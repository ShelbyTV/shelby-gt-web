class HomeController < ApplicationController

  def index
    Rails.logger.info "API cookie:  #{cookies.signed['_shelby_gt_api_session']}"
    if @gt_api_cookie = cookies.signed['_shelby_gt_api_session'] and @gt_api_cookie['signed_in']
      render 'app'
    else
      @twitter_login_url = Settings::ShelbyAPI.url + '/auth/twitter'
      @facebook_login_url = Settings::ShelbyAPI.url + '/auth/facebook'
      @tumblr_login_url = Settings::ShelbyAPI.url + '/auth/tumblr'
      render 'login'
    end
  end
  
  def signout
    cookies.signed['_shelby_gt_api_session'] = nil
    redirect_to root_path
  end

end
