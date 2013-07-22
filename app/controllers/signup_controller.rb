class SignupController < ApplicationController

  def show
    # just show the freakin form.
    @user = {}

    if session[:user_errors]
      @user_attributes = session[:user_attributes]
      # send the errors along to the view so we can render appropriate feedback
      @email_error = session[:user_errors][:email]
      @nickname_error = session[:user_errors][:nickname]
    end
  end

  #actually create the user, if errors, go back to show and show what failed
  def create
    if create_user!
      redirect_to :root
    else
      redirect_to '/signup'
    end
  end

  private

    def create_user!
      attributes = params.select { |k,v| ['nickname', 'name', 'primary_email', 'password'].include? k }
      r = Shelby::API.create_user({:user => attributes}, "", false)#, Shelby::CookieUtils.generate_cookie_string(cookies), csrf_token_from_cookie)
      # proxy the cookies
      #Shelby::CookieUtils.proxy_cookies(cookies, r.headers['set-cookie'])
      if r.code != 200
        # preserve the user input so they can see what the erroneous input was
        session[:user_attributes] = attributes
        # send the errors along to the view so we can render appropriate feedback
        errors = r.parsed_response['errors']
        session[:user_errors] = {}
        session[:user_errors][:email] = Shelby::HashErrorChecker.get_hash_error(errors, ['user', 'primary_email'])
        session[:user_errors][:nickname] = Shelby::HashErrorChecker.get_hash_error(errors, ['user', 'nickname'])
        return false
      else
        @user = r['result']
        return true
      end
    end

end
