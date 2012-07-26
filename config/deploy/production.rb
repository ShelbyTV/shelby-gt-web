require 'bundler/capistrano'
#############################################################
#	Servers
#############################################################

role :web, "50.56.112.113"
role :app, "50.56.112.113"

#############################################################
#	Git
#############################################################

set :repository,  "git@github.com:ShelbyTV/shelby-gt-web.git"
set :branch, "unicorn"

set :current_path, '/home/gt/web/current'