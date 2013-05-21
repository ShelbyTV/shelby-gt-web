class SignupController < ApplicationController
  def index

    if user_signed_in?
      unless session[:signup] && session[:signup][:step] && session[:signup][:step] >= Settings::Signup.service_authentication_step
        # if the session doesn't tell us that we're in the authenticated portion of signup flow,
        # a logged in user should be redirected into the shelby Backbone app
        redirect_to root_url and return
      else
        # otherwise we need to fetch the user's info to be used in our form
        @user = Shelby::API.get_current_user(request.headers['HTTP_COOKIE'])
        @facebook_connected = @user.authentications.any { |a| a.provider == 'facebook' }
        @twitter_connected = @user.authentications.any { |a| a.provider == 'twitter' }
      end
    end

    # if the session doesn't tell us what step we're on,
    # we're on the first step
    session[:signup] ||= {}
    if session[:signup][:step].nil?
      session[:signup][:step] = 1
    end

    # do parameter handling for individual steps before we decide if we can
    # advance to the next step
    @validation_ok = true
    if params[:commit] && (params[:commit] == 'facebook' || params[:commit] == 'twitter')
      # to do service authoriziation for Twitter or Facebook, redirect to appropriate
      # authentication route but don't advance to the next signup step
      redirect_to "#{Settings::ShelbyAPI.url}/auth/#{params[:commit].downcase}" and return
    elsif session[:signup][:step] == Settings::Signup.user_update_step
      processUserUpdateStep
    end

    if params[:commit] && @validation_ok
      session[:signup][:step] = session[:signup][:step] + 1
      Rails.logger.info "Advancing"
    end

    # some steps in the flow require special handling
    if session[:signup][:step] > Settings::Signup.num_steps
      # if we've passed the last step, enter the shelby
      # backbone app proper and clear the session signup progress state
      session[:signup].delete(:step)
      redirect_to root_url and return
    end

    # for every normal step, we need to set the step parameter and render the page
    @step = session[:signup][:step]
    render "/signup/step#{@step}"

  end

  private

    # for the user update step, try to update the user, and
    # prevent advancing to the next step if something fails
    # returns user if successfull, nil otherwise
    def processUserUpdateStep
      Rails.logger.info params.inspect
      attributes = params.select { |k,v| ['nickname', 'name', 'primary_email'].include? k }
      r = Shelby::API.update_user(@user['id'], attributes, request.headers['HTTP_COOKIE'], csrf_token_from_cookie)
      if r.code != 200
        # preserve the user input so they can see what the erroneous input was
        @user.merge! attributes
        # send the errors along to the view so we can render appropriate feedback
        @errors = r.parsed_response['errors']
      end
      @validation_ok = false
    end
end
