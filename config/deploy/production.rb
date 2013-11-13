#############################################################
# Servers
#############################################################

role :web, "50.56.123.84", "192.237.184.30"
role :app, "50.56.123.84", "192.237.184.30"

#############################################################
# Git
#############################################################

set :repository,  "git@github.com:ShelbyTV/shelby-gt-web.git"
set :branch, "master"
set :rails_env, "production"
set :unicorn_env, "production"
set :app_env,     "production"