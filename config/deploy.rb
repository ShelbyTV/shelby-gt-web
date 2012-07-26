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
#	Bundler
#############################################################

namespace :bundler do
  task :create_symlink, :roles => :app do
    shared_dir = File.join(shared_path, 'bundle')
    release_dir = File.join(current_release, '.bundle')
    run("mkdir -p #{shared_dir} && ln -s #{shared_dir} #{release_dir}")
  end

  task :bundle_new_release, :roles => :app do
    bundler.create_symlink
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
  load 'deploy/assets'
end

#############################################################
#	Multistage Deploy via capistrano-ext
#############################################################

set :stages, %w(production iso_roll)
set :default_stage, 'production'
require 'capistrano/ext/multistage'