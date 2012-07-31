source 'https://rubygems.org'

gem 'rails', '3.2.2'

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
end

gem 'jquery-rails'

# Use Jammit
# NOTE: The most recent version of jammit (0.6.5) includes ruby-yui-compressor (https://github.com/sstephenson/ruby-yui-compressor) which
# is at version 0.9.6 which includes yui-compressor version 2.4.4 which chokes on inline svg.  See assets.yml for the temporary fix.
# gem 'jammit'

# Deploy with Capistrano
gem 'capistrano'

# To use debugger
# gem 'ruby-debug19', :require => 'ruby-debug'

group :test, :development do
	gem 'jasmine'
	gem 'sinon-rails'
	gem 'jasmine-sinon-rails'
end