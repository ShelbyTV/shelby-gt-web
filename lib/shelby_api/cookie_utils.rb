require 'cookiejar/cookie_validation'
require 'uri'

module Shelby
  class CookieUtils
    # take set cookie headers received from a call to an external
    # resource and proxy the ones that are on the domain
    # of this rails app to the request currently being serviced
    # by this app
    def self.proxy_cookies(rails_cookies, set_cookie_headers)
      if set_cookie_headers
        set_cookie_headers.split(/, (?=[\w]+=)/).each do |c|
          # parse the set cookie header
          cookie = CookieJar::CookieValidation.parse_set_cookie(c)
          # massage the parsed cookie hash to have the key names that
          # are supported by the rails cookie interface
          cookie_params = cookie.clone
          cookie_params.delete :name
          cookie_params.delete :version
          cookie_params[:expires] = cookie_params.delete :expires_at
          cookie_params[:httponly] = cookie_params.delete :http_only
          cookie_params[:value] = URI.unescape(cookie_params[:value])
          cookie_params.delete_if { |k,v| v.nil? }
          # set the cookie on the client request we are currently servicing
          rails_cookies[cookie[:name]] = cookie_params
        end
      end
    end

    # turn the contents of rails_cookies into the kind
    # of string that is used for a cookie header
    def self.generate_cookie_string(rails_cookies)
      cookie_string = ''
      rails_cookies.each do |k,v|
        cookie_string << "; #{k}=#{v}"
      end
      cookie_string.slice!('; ')
      return cookie_string
    end
  end
end
