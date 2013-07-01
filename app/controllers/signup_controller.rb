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
      # get the info for the current user
      @user = Shelby::API.get_current_user(Shelby::CookieUtils.generate_cookie_string(cookies))
      if @user
        if @user['app_progress'] && @user['app_progress']['onboarding']
          # if the user has already completed signup, redirect them into the Backbone app
          redirect_to root_url and return
        end
        @facebook_connected = @user['authentications'] && @user['authentications'].any? { |a| a['provider'] == 'facebook' }
        @twitter_connected = @user['authentications'] && @user['authentications'].any? { |a| a['provider'] == 'twitter' }
        followRolls! if session[:signup][:rolls_to_follow]
      else
        # something went wrong with the user's session, so start over
        session[:signup][:step] = 1
        cookies.delete(:_shelby_gt_common, :domain => '.shelby.tv')
        redirect_to({:action => 'index'}, {:alert => "Your session expired. Please try again."}) and return
      end
    else
      @user = {}
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
    elsif params[:commit] and (session[:signup][:step] == Settings::Signup.service_authentication_step)
      followShelbyTwitter if params[:follow_shelby]
      updateOpenGraphSetting if params[:publish_shelby]
    elsif params[:commit] && session[:signup][:step] == Settings::Signup.user_update_step
      if user_signed_in?
        updateUser
      else
        createUser
        followRolls! if session[:signup][:rolls_to_follow]
      end
      # if we are getting here, they should be considered through onboarding
      setOnboardingComplete! if @validation_ok
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
    elsif params[:commit] && (session[:signup][:step] == Settings::Signup.user_update_step)
      # if we're on the user update step, check on possible errors
      @nickname_error = Shelby::HashErrorChecker.get_hash_error(@errors, ['user', 'nickname'])
      @email_error = Shelby::HashErrorChecker.get_hash_error(@errors, ['user', 'primary_email'])
    end

    # for every normal step, we need to set the step parameter and render the page
    @step = session[:signup][:step]
    render "/signup/step#{@step}"

  end

  private

    # for the user update step, try to update the user, and
    # prevent advancing to the next step if something fails
    def updateUser
      attributes = params.select { |k,v| ['nickname', 'name', 'primary_email', 'password'].include? k }
      # api requires double entry of password for confirmation so we'll fake it
      attributes['password_confirmation'] = attributes['password']
      r = Shelby::API.update_user(@user['id'], attributes, Shelby::CookieUtils.generate_cookie_string(cookies), csrf_token_from_cookie)
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
    end

    # for the user update step, try to create a new user with username and password, and
    # prevent advancing to the next step if something fails
    def createUser
      attributes = params.select { |k,v| ['nickname', 'name', 'primary_email', 'password'].include? k }
      r = Shelby::API.create_user({:user => attributes}, Shelby::CookieUtils.generate_cookie_string(cookies), csrf_token_from_cookie)
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
    end

    def setOnboardingComplete!
      attributes = {:app_progress => {:onboarding => true} }
      r = Shelby::API.update_user(@user['id'], attributes, Shelby::CookieUtils.generate_cookie_string(cookies), csrf_token_from_cookie)
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
    end

    # roll followings happen here, asyncronously using event machine.
    def followRolls!
      Rails.logger.info "===== Following Rolls"
      roll_ids = session[:signup][:rolls_to_follow]
      roll_ids.each do |r|
        EM.next_tick {
          Rails.logger.info "===== Next Tick"
          begin
            r = Shelby::API.join_roll(r, Shelby::CookieUtils.generate_cookie_string(cookies), csrf_token_from_cookie)
            # proxy the cookies
            Shelby::CookieUtils.proxy_cookies(cookies, r.headers['set-cookie'])
            Rails.logger.info "===== Response: #{r}"
          rescue => e
            # TODO: we should be tracking if something goes wrong here (using GA maybe?)
          end
        }
      end
      session[:signup].delete([:rolls_to_follow])
      @rolls_followed = true
    end

    # save rolls to follow in session for later
    def set_rolls_to_follow
      # user much choose at least one roll, if not, send back to begining and show a message
      (@validation_ok = false; return) unless params[:rolls] and (params[:rolls].length > 2)
      rolls_to_follow = params[:rolls].keys
      # must have at least one roll followed. otherwise we should not advance to next step
      # save rolls to follow in session to be followed after user creation.
      session[:signup][:rolls_to_follow]  = rolls_to_follow
    end

    def followShelbyTwitter
      r = Shelby::API.follow_shelby_on_twitter(Shelby::CookieUtils.generate_cookie_string(cookies), csrf_token_from_cookie)
      Shelby::CookieUtils.proxy_cookies(cookies, r.headers['set-cookie'])
    end

    def updateOpenGraphSetting
      pref =  {:preferences => { :open_graph_posting => true }}
      r = Shelby::API.update_user(@user['id'], pref, Shelby::CookieUtils.generate_cookie_string(cookies), csrf_token_from_cookie)
      Shelby::CookieUtils.proxy_cookies(cookies, r.headers['set-cookie'])
      Rails.logger.info "Posting Shelby! Yay!"
    end
end
