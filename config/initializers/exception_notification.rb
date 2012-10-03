if Rails.env == "production"
  ShelbyGtWeb::Application.config.middleware.use ExceptionNotifier,
    :email_prefix => "[GT WebApp Error] ",
    :sender_address => %{"ShelbyGT Notifier" <whatever-noreply@shelby.com>},
    :exception_recipients => %w{gt-web-errors@shelby.tv}
end