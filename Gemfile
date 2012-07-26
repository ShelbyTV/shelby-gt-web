source 'https://rubygems.org'

gem 'rails', '3.2.2'

#
# ---------- Config
#
gem "settingslogic"

#
# ---------- Shelby API
#
gem 'httparty'
# Needed to decode the gt api server cookie
gem 'bson_ext'
gem 'bson'


#
# -- Quiet Logging
#
gem 'quiet_assets', :group => :development

#
# Gems used only for assets and not required
# in production environments by default.
group :assets do
  # gem 'sass-rails',   '~> 3.2.3'
  gem "compass", "0.11.7"
end

#
# -- Asset Compression
#

# NOTE: The most recent version of jammit (0.6.5) includes ruby-yui-compressor (https://github.com/sstephenson/ruby-yui-compressor) which
# is at version 0.9.6 which includes yui-compressor version 2.4.4 which chokes on inline svg.  See assets.yml for the temporary fix.
gem 'jammit'
gem 'js_erb'


#
# -- Deployment
#
gem 'capistrano'
gem 'rvm-capistrano'
group :development do
  gem 'capistrano-unicorn', :require => false
end


#
# ----------- Web Server
#
gem 'unicorn'


# To use debugger
# gem 'ruby-debug19', :require => 'ruby-debug'
