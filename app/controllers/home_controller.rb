class HomeController < ApplicationController

  #before_filter :authenticate_user!

  def index
    Rails.logger.info 'SESSION: '+session.to_s
    Rails.logger.info 'COOKIES: '+cookies[:_shelby_gt_session].to_s
    render 'app'
  end

end
