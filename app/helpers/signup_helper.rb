module SignupHelper

  def create_user!(params, cookies)
    attributes = params.select { |k,v| ['nickname', 'name', 'primary_email', 'password'].include? k }
    r = Shelby::API.create_user({:user => attributes}, Shelby::CookieUtils.generate_cookie_string(cookies), csrf_token_from_cookie)
    # proxy the cookies
    Shelby::CookieUtils.proxy_cookies(cookies, r.headers['set-cookie'])
    if r.code != 200
      # preserve the user input so they can see what the erroneous input was
      session[:user_attributes] = attributes
      # send the errors along to the view so we can render appropriate feedback
      errors = r.parsed_response['errors']
      session[:user_errors] = {}
      session[:user_errors_email] = Shelby::HashErrorChecker.get_hash_error(errors, ['user', 'primary_email'])
      session[:user_errors_nickname] = Shelby::HashErrorChecker.get_hash_error(errors, ['user', 'nickname'])
      return false
    else
      @user = r['result']
      return true
    end
  end

end
