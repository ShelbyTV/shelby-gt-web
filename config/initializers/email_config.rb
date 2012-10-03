#############
# Email Setup via Sendgrid:
ActionMailer::Base.smtp_settings = {
  :address => "smtp.sendgrid.net",
  :port => 25,
  :domain => "shelby.tv",
  :authentication => :plain,
  :user_name => Settings::Sendgrid.username,
  :password => Settings::Sendgrid.password
}
# FYI: if port 25 blocked by isp use:
# port 587 with :enable_starttls_auto => true