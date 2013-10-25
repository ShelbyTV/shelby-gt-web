source 'https://rubygems.org'

gem 'rails', "~> 3.2.13"
# json is a dependency of rails, want to make sure we are secure with at least 1.7.7
gem 'json', "~> 1.7.7"

# Needed to decode the gt api server cookie
gem 'bson_ext'
gem 'bson'

#
# ---------- Config
#
gem "settingslogic"

#
# ---------- Shelby API
#
gem 'httparty'
gem 'eventmachine'

#
# ---------- Smarter cookie parsing
#
gem 'cookiejar'

#
# ---------- Mobile Search
#
gem 'youtube_it'

# ---------- A/B Testing
#
gem 'vanity', "~> 1.8.1"

# ---------- Other utils
#
gem 'addressable' # for URI parsing

#
# ---------- External Services
#
gem 'koala'

#
# -- Quiet Logging
#
gem 'quiet_assets', :group => :development

#
# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails', '~> 3.2.5'
  gem 'compass-rails', '~> 1.0.3'
  gem 'ejs'
  gem 'yui-compressor'
  gem 'turbo-sprockets-rails3'
end

gem 'jquery-rails'

# Use Jammit
# NOTE: The most recent version of jammit (0.6.5) includes ruby-yui-compressor (https://github.com/sstephenson/ruby-yui-compressor) which
# is at version 0.9.6 which includes yui-compressor version 2.4.4 which chokes on inline svg.  See assets.yml for the temporary fix.
# gem 'jammit'

# Deploy with Capistrano
gem 'capistrano', '2.15.2'
gem 'rvm-capistrano'
group :production, :staging do
  gem "therubyracer"
  gem "uglifier"
end
group :development do
  gem 'capistrano-unicorn', :require => false
  gem 'thin'
end

#
# ----------- Web Server
#
group :production, :staging do
  gem 'unicorn'
  gem 'kgio'
  gem 'raindrops'
end

#
# ---------- Error Monitoring
#
gem 'exception_notification', :require => "exception_notifier"

# To use debugger
# gem 'ruby-debug19', :require => 'ruby-debug'

group :test, :development do
  gem 'capybara'
  gem 'capybara-webkit'
  gem 'mini_magick' # for rendering screenshots from capybara webkit
  gem 'headless'
  gem 'rspec-rails'
  gem 'jasmine', :git => "git://github.com/pivotal/jasmine-gem.git"
  gem 'sinon-rails'
  gem 'jasmine-sinon-rails'
  gem 'jasmine-jquery-rails'
end
