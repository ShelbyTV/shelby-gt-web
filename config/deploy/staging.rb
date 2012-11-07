#############################################################
#	Servers
#############################################################

role :web, "50.56.123.73"
role :app, "50.56.123.73"

#############################################################
#	Git
#############################################################

set :repository,  "git@github.com:ShelbyTV/shelby-gt-web.git"
set :branch, fetch(:branch, "staging")
set :rails_env, "staging"
set :unicorn_env, "staging"
set :app_env,     "staging"
require 'capistrano-unicorn'

namespace :deploy do
  task :write_branch_settings do
    puts self[:deploy_to]
  end
end

after "deploy:update_code", "deploy:write_branch_settings"