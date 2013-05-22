class SignupController < ApplicationController
  def index

    session[:signup] ||= {}
    if params[:step]
      session[:signup][:step] = params[:step].to_i
    elsif session[:signup][:step].nil?
      # if neither the params nor the session tells us what step we're on,
      # we're on the first step
      session[:signup][:step] = 1
    end

    if user_signed_in?
      unless session[:signup][:step] >= Settings::Signup.service_authentication_step
        # if the session doesn't tell us that we're in the authenticated portion of signup flow,
        # a logged in user should be redirected into the shelby Backbone app
        redirect_to root_url and return
      else
        # otherwise we need to fetch the user's info to be used in our form
        @user = Shelby::API.get_current_user(request.headers['HTTP_COOKIE'])
        @facebook_connected = @user['authentications'].any? { |a| a['provider'] == 'facebook' }
        @twitter_connected = @user['authentications'].any? { |a| a['provider'] == 'twitter' }
        followRolls! unless @rolls_followed
      end
    end

    # do parameter handling for individual steps before we decide if we can
    # advance to the next step
    @validation_ok = true
    if params[:commit] && (params[:commit] == 'facebook' || params[:commit] == 'twitter')
      # to do service authoriziation for Twitter or Facebook, redirect to appropriate
      # authentication route but don't advance to the next signup step
      redirect_to "#{Settings::ShelbyAPI.url}/auth/#{params[:commit].downcase}" and return
    elsif params[:commit] and (session[:signup][:step] == Settings::Signup.roll_selection_step)
      set_rolls_to_follow
    elsif params[:commit] && session[:signup][:step] == Settings::Signup.user_update_step
      if user_signed_in?
        updateUser
      else
        createUser
        followRolls! unless @rolls_followed
      end
    end

    if params[:commit] && @validation_ok
      session[:signup][:step] = session[:signup][:step] + 1
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
    def updateUser
      attributes = params.select { |k,v| ['nickname', 'name', 'primary_email'].include? k }
      r = Shelby::API.update_user(@user['id'], attributes, request.headers['HTTP_COOKIE'], csrf_token_from_cookie)
      # proxy the cookies
      Shelby::CookieUtils.proxy_cookies(cookies, r.headers['set-cookie'])
      if r.code != 200
        # preserve the user input so they can see what the erroneous input was
        @user.merge! attributes
        # send the errors along to the view so we can render appropriate feedback
        @errors = r.parsed_response['errors']
        @validation_ok = false
      else
        @user = r['result']
      end
      Rails.logger.info @errors.inspect
    end

    # for the user update step, try to create a new user with username and password, and
    # prevent advancing to the next step if something fails
    def createUser
      attributes = params.select { |k,v| ['nickname', 'name', 'primary_email', 'password'].include? k }
      r = Shelby::API.create_user({:user => attributes}, request.headers['HTTP_COOKIE'], csrf_token_from_cookie)
      # proxy the cookies
      Shelby::CookieUtils.proxy_cookies(cookies, r.headers['set-cookie'])
      if r.code != 200
        # preserve the user input so they can see what the erroneous input was
        @user = attributes
        # send the errors along to the view so we can render appropriate feedback
        @errors = r.parsed_response['errors']
        @validation_ok = false
      else
        @user = r['result']
      end
      Rails.logger.info @errors.inspect
    end

    # roll followings happen here, asyncronously using event machine.
    def followRolls!
      roll_ids = session[:signup][:rolls_to_follow]
      roll_ids.each do |r|
        EM.next_tick {
          begin
            Rails.logger.info "Would have followed: #{r}"
            #Shelby::API.join_roll(r, cookie, token)
          rescue => e
            # TODO: we should be tracking if something goes wrong here (using GA maybe?)
          end
        }
      end
      @rolls_followed = true
    end

    # save rolls to follow in session for later
    def set_rolls_to_follow
      # user much choose at least one roll, if not, send back to begining and show a message
      (@validation_ok = false; return) unless params[:rolls]
      rolls_to_follow = params[:rolls].keys
      # must have at least one roll followed. otherwise we should not advance to next step
      # save rolls to follow in session to be followed after user creation.
      session[:signup][:rolls_to_follow]  = rolls_to_follow
    end
end
