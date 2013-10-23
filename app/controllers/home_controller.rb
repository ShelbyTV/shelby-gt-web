require 'shelby_api'

class HomeController < ApplicationController
  include MobileHelper
  helper :meta_tag

  # In non-pushstate browsers, Backone redirects to shelby.tv/hash_app#<the original fragment>
  # Need to load the app in that case and let routing take place like normal on the hash fragment
  def hash_app
    render '/home/app'
  end

  ##
  # Handles logged out - static landing page
  #         logged in - js app
  #         iso rolls - static page with iframe of app
  #                     XXX want to move this out of here with smart routing in routes.rb
  #         fb genius - renders js app w fb flavor
  #
  def index

    respond_to do |format|
      # this is the catch-all route to redirect unknown routes to our app root, but it's
      # only meant to handle requests for html pages
      format.html {


        # Consider errors and render landing page
        @mobile_os     = detect_mobile_os
        @is_mobile     = is_mobile?

        if flash[:user_errors]
          @user_attributes = flash[:user_attributes]
          @email_error = flash[:user_errors_email]
          @nickname_error = flash[:user_errors_nickname]
        end

        view_context.get_info_for_meta_tags(params[:path])

        # if @mobile_os
        #   render '/mobile/search', :layout => 'mobile'
        # else

        # A/B tests
        #@landing_messaging_v2 = ab_test :landing_messaging_v2
        #@signup_on_landing = ab_test :signup_on_landing
        #@signup_w_fb = ab_test :signup_w_fb

        render '/home/landing'

      }
      # if we hit this as the catch-all while looking for an image or some other special format,
      # we can't render anything appropriate so send a 404
      format.any {
        head :not_found
      }
    end
  end

  ##
  # Handles team page
  #
  # GET /team
  #
  def team
    @team = :true
    render '/home/landing'
  end

  # Static page of information
  def learn_more
  end
end
