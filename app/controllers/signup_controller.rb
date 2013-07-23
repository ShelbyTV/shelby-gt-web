class SignupController < ApplicationController
  include SignupHelper

  def show
    # just show the freakin form.
    @inviter = Shelby::API.get_user(params[:code]) if params[:code]

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
