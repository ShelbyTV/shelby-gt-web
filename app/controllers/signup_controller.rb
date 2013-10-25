class SignupController < ApplicationController
  include SignupHelper

  def show
    @onboarding_with_invites = ab_test :onboarding_with_invites

    # just show the freakin form.
    if params[:code]
      @inviter = Shelby::API.get_user(params[:code])
      @og_url = request.original_url
      session[:invite_code] = params[:code]
    end

    if flash[:user_errors]
      @user_attributes = flash[:user_attributes]
      @email_error = flash[:user_errors_email]
      @nickname_error = flash[:user_errors_nickname]
    end

    @social_signup_error = params[:social_signup]
  end

  # actually create the user, if errors, go back to show and show what failed
  def create
    if create_user!(params, cookies)
      # the new user should follow an inviter if they are invited, its only nice. and asynchronous
      EM.next_tick { follow_inviter!(session[:invite_code], cookies) if session[:invite_code] }
      redirect_to :root
    else
      if !request.referrer
        redirect_to :signup
      elsif URI(request.referer).path == "/"
        redirect_to :root
      else
        redirect_to :signup
      end
    end
  end
end
