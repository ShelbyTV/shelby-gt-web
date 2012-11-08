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
    # load the default branch settings from file
    branch_settings = YAML.load(ERB.new(open("config/settings/branch.yml").read).result).to_hash

    # update the name of the branch for staging with the branch being deployed
    branch_settings["staging"]["branch"] = branch

    # write the change to the branch settings file on the server
    yaml_lines = YAML::dump(branch_settings).split("\n")
    branch_settings_file = "#{release_path}/config/settings/branch.yml"
    run "cat /dev/null > #{branch_settings_file}"
    yaml_lines.each do |line|
      run "echo -e '#{line}' >> #{branch_settings_file}"
    end
  end
end

after "deploy:update_code", "deploy:write_branch_settings"