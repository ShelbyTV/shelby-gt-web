#############################################################
#	Servers
#############################################################

role :web, "108.171.161.62"
role :app, "108.171.161.62"

#############################################################
#	Git
#############################################################

set :repository,  "git@github.com:ShelbyTV/shelby-gt-web.git"
set :branch, "master"

#############################################################
# Passenger
#############################################################

namespace :passenger do
  desc "Restart Application"
  task :restart do
    run "touch #{current_path}/tmp/restart.txt"
  end
end

namespace :deploy do
  desc "Restart passenger"
  task :restart do
    passenger.restart
  end
end