class SignupController < ApplicationController
  def index
    #except in one special case, an authenticated user should not visit signup,
    #so redirect them into the app
    if user_signed_in?
      redirect_to root_url and return
    else
      #validation of params goes here
      #possible actions,
      #don't do below if no-work
      if params[:step]
        session[:signup] ||= {}
        session[:signup][:step] = params[:step].to_i + 1
      end

      if session[:signup].nil?
        @step = 1
        render '/signup/step1'
      else session[:signup][:step]
        @step = session[:signup][:step]
        render "/signup/step#{@step}"
      end
    end
  end
end
