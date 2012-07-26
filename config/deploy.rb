set :application, "gt"
set :user, "gt"
set :deploy_to, "/home/gt/web"

# Use developer's local ssh keys when git clone/updating on the remote server
default_run_options[:pty] = true
ssh_options[:forward_agent] = true

#############################################################
#	RVM
#############################################################
$:.unshift(File.expand_path('./lib', ENV['rvm_path']))
require "rvm/capistrano"
set :rvm_type, :user
set :rvm_ruby_string, '1.9.3-p194'
set :current_path, '/home/gt/web'


default_run_options[:pty] = true

#############################################################
#	Git
#############################################################

set :scm, :git

#keep a local cache to speed up deploys
set :deploy_via, :remote_cache

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

set :stages, %w(production iso_roll)
set :default_stage, 'production'
require 'capistrano/ext/multistage'
require 'capistrano-unicorn'