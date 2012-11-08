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
  desc "Write the name of the branch being deployed into a settings file that the app can use"
  task :write_branch_settings do
    run "sed -i 's/\"staging\"/#{branch}/' #{release_path}/config/settings/branch.yml"
  end
end

before "deploy:assets:precompile", "deploy:write_branch_settings"