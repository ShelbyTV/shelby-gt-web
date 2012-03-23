set :application, "shelby-gt-web"
set :user, "gt"

# version control
set :scm, :git
set :repository,  "git@github.com:ShelbyTV/shelby-gt-web.git"
set :branch, :master

# Use developer's local ssh keys when git clone/updating on the remote server
ssh_options[:forward_agent] = true
#keep a local cache to speed up deploys
set :deploy_via, :remote_cache
set :deploy_to, "/home/gt/web"
default_run_options[:pty] = true

# Your HTTP server, Apache/etc
role :web, "108.171.161.62"
# This may be the same as your `Web` server
role :app, "108.171.161.62"

# Passenger setup
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
end
