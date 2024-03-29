module SignupHelper

  def create_user!(params, cookies)
    attributes = params.select { |k,v| ['nickname', 'name', 'primary_email', 'password'].include? k }
    r = Shelby::API.create_user({:user => attributes}, Shelby::CookieUtils.generate_cookie_string(cookies), csrf_token_from_cookie)
    # proxy the cookies
    Shelby::CookieUtils.proxy_cookies(cookies, r.headers['set-cookie'])
    if r.code != 200
      # preserve the user input so they can see what the erroneous input was
      flash[:user_attributes] = attributes
      # send the errors along to the view so we can render appropriate feedback
      errors = r.parsed_response['errors']
      flash[:user_errors] = {}
      flash[:user_errors_email] = Shelby::HashErrorChecker.get_hash_error(errors, ['user', 'primary_email'])
      flash[:user_errors_nickname] = Shelby::HashErrorChecker.get_hash_error(errors, ['user', 'nickname'])
      return false
    else
      @user = r['result']
      return true
    end
  end

  def follow_inviter!(user_id, cookies)
    if user = Shelby::API.get_user(user_id)
      r = Shelby::API.join_roll(user['personal_roll_id'], Shelby::CookieUtils.generate_cookie_string(cookies), csrf_token_from_cookie)
      # proxy the cookies
      Shelby::CookieUtils.proxy_cookies(cookies, r.headers['set-cookie']) if r
    end
  end

  def user_first_name(user)
    user_name = user['name'] && user['name'].lstrip
    user_first_name = user_name && user_name.split(/\s+/, 2)[0]
    user_first_name && user_first_name.strip!
    (user_first_name && (user_first_name.length > 0)) ? user_first_name : user['nickname']
  end

  def user_facebook_image(user)
    facebook_auth = user['authentications'].find {|a| a['provider'] == 'facebook'}
    facebook_auth && "http://graph.facebook.com/#{facebook_auth['uid']}/picture?type=large"
  end

  def form_class(referer)
    class_list = "form_module two-thirds js-form"

    unless referer == 'email'
      class_list << " hidden"
    end

    class_list
  end
end
