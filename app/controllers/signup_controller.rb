class SignupController < ApplicationController
  def index

    if user_signed_in?
      unless session[:signup] && session[:signup][:step] && session[:signup][:step] >= Settings::Signup.service_authentication_step
      # if the session doesn't tell us that we're in the authenticated portion of signup flow,
      # a logged in user should be redirected into the shelby Backbone app
      redirect_to root_url and return
      end
    end

    #validation of params goes here
    #possible actions,
    #don't do below if no-work
    session[:signup] ||= {}

    if session[:signup][:step].nil?
      session[:signup][:step] = 1
    elsif params[:commit]
      session[:signup][:step] = session[:signup][:step] + 1
      Rails.logger.info "Advancing"
    end


    # some steps in the flow require special handling
    if session[:signup][:step] > Settings::Signup.num_steps
      # if we've passed the last step, enter the shelby
      # backbone app proper and clear the session signup progress state
      session[:signup].delete(:step)
      redirect_to root_url and return
    elsif params[:commit] && (params[:commit] == 'Facebook' || params[:commit] == 'Twitter')
      # service authoriziation needs special handling to go through authentication first
      # if the user connected an external service like Twitter
      redirect_to "#{Settings::ShelbyAPI.url}/auth/#{params[:commit].downcase}" and return
    end

    # for every normal step, we need to set the step parameter and render the page
    @step = session[:signup][:step]
    render "/signup/step#{@step}"


  end
end
