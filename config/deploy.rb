require "bundler/capistrano"

set :application, "shelby-gt-web"
set :user, "gt"
set :deploy_to, "/home/gt/web"

default_run_options[:pty] = true

#############################################################
#	Git
#############################################################

set :scm, :git

#keep a local cache to speed up deploys
set :deploy_via, :remote_cache
# Use developer's local ssh keys when git clone/updating on the remote server
ssh_options[:forward_agent] = true


#############################################################
#	Passenger
#############################################################

namespace :deploy do
 task :start do ; end
 task :stop do ; end
 task :restart, :roles => :app, :except => { :no_release => true } do
   run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
 end
end

#############################################################
#	Multistage Deploy via capistrano-ext
#############################################################

set :stages, %w(production iso_roll)
set :default_stage, 'production'
require 'capistrano/ext/multistage'