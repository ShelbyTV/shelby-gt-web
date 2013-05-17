class SignupController < ApplicationController
  def index
    #except in one special case, an authenticated user should not visit signup,
    #so redirect them into the app
    if user_signed_in?
      redirect_to root_url and return
    end
  end
end
