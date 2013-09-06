#############################################################
# Servers
#############################################################

role :web, "119.9.14.236"
role :app, "119.9.14.236"

#############################################################
# Git
#############################################################

set :repository,  "git@github.com:ShelbyTV/shelby-gt-web.git"
set :branch, "onshelby-tv"
set :rails_env, "seo1"
set :unicorn_env, "production"
set :app_env,     "seo1"
