#############################################################
#	Servers
#############################################################

role :web, "50.56.123.84"
role :app, "50.56.123.84"

#############################################################
#	Git
#############################################################

set :repository,  "git@github.com:ShelbyTV/shelby-gt-web.git"
set :branch, "master"
set :rails_env, "production"
set :unicorn_env, "production"
set :app_env,     "production"
require 'capistrano-unicorn'