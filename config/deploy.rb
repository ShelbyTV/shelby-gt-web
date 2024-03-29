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
#	Multistage Deploy via capistrano-ext
#############################################################

set :stages, %w(staging production)
set :default_stage, 'staging'
require 'capistrano/ext/multistage'
require 'capistrano-unicorn'
after 'deploy:restart', 'unicorn:duplicate'