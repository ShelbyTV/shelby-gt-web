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
#	Bundler
#############################################################

namespace :bundler do
  task :symlink, :roles => :app do
    shared_dir = File.join(shared_path, 'bundle')
    release_dir = File.join(current_release, '.bundle')
    run("mkdir -p #{shared_dir} && ln -s #{shared_dir} #{release_dir}")
  end

  task :bundle_new_release, :roles => :app do
    bundler.symlink
    run "cd #{release_path} && bundle install --without test"
  end

  task :lock, :roles => :app do
    run "cd #{current_release} && bundle lock;"
  end

  task :unlock, :roles => :app do
    run "cd #{current_release} && bundle unlock;"
  end
end

after "deploy:update_code" do
 bundler.bundle_new_release
end

#############################################################
#	Multistage Deploy via capistrano-ext
#############################################################

set :stages, %w(production staging iso_roll)
set :default_stage, 'staging'
require 'capistrano/ext/multistage'
require 'capistrano-unicorn'