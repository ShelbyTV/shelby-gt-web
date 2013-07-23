class SignupController < ApplicationController
  include SignupHelper

  def show
    # just show the freakin form.
    @inviter = get_inviter_info(params[:code]) if params[:code]

    Rails.logger.info "USER: #{@inviter}"

    if session[:user_errors]
      @user_attributes = session[:user_attributes]
      @email_error = session[:user_errors_email]
      @nickname_error = session[:user_errors_nickname]
    end
  end

  #actually create the user, if errors, go back to show and show what failed
  def create
    if create_user!(params, cookies)
      redirect_to :root
    else
      redirect_to :signup
    end
  end
end
