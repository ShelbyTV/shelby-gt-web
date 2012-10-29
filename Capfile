# Load RVM's capistrano plugin.
require "rvm/capistrano"
# Set it to the ruby + gemset of your app, e.g:
set :rvm_ruby_string, 'ruby-1.9.3'
set :rvm_type, :user

load 'deploy' if respond_to?(:namespace) # cap2 differentiator

load 'deploy/assets'
#Dir['vendor/gems/*/recipes/*.rb','vendor/plugins/*/recipes/*.rb'].each { |plugin| load(plugin) }
load 'config/deploy' # remove this line to skip loading any of the default tasks