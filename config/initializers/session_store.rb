# Be sure to restart your server when you modify this file.

ShelbyGtWeb::Application.config.session_store :cookie_store, :key=> '_shelby_gt_web_session', :domain => '.shelby.tv'

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rails generate session_migration")
# ShelbyGtWeb::Application.config.session_store :active_record_store
