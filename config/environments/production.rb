require "yui/compressor"
require 'unicorn/worker_killer'

ShelbyGtWeb::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb

  # Code is not reloaded between requests
  config.cache_classes = true

  # Full error reports are disabled and caching is turned on
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Disable Rails's static asset server (Apache or nginx will already do this)
  config.serve_static_assets = false

  # Compress JavaScripts and CSS
  config.assets.compress = true
  config.assets.js_compressor = YUI::JavaScriptCompressor.new( :jar_file => "lib/yui-compressor/yuicompressor-2.4.7.jar" )
  config.assets.css_compressor = YUI::CssCompressor.new( :jar_file => "lib/yui-compressor/yuicompressor-2.4.7.jar" )

  # Don't fallback to assets pipeline if a precompiled asset is missed
  config.assets.compile = false

  # Generate digests for assets URLs
  config.assets.digest = true

  # Defaults to Rails.root.join("public/assets")
  # config.assets.manifest = YOUR_PATH

  # Specifies the header that your server uses for sending files
  # config.action_dispatch.x_sendfile_header = "X-Sendfile" # for apache
  # config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect' # for nginx

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  # config.force_ssl = true

  # See everything in the log (default is :info)
  # config.log_level = :debug

  # Prepend all log lines with the following tags
  # config.log_tags = [ :subdomain, :uuid ]

  # Use a different logger for distributed setups
  # config.logger = ActiveSupport::TaggedLogging.new(SyslogLogger.new)

  # Use a different cache store in production
  # config.cache_store = :mem_cache_store

  # Enable serving of images, stylesheets, and JavaScripts from an asset server
  config.action_controller.asset_host = "//shelby.tv"

  # Precompile additional assets (application.js, application.css, image files must be included if they're going to be cache-busted)
  config.assets.precompile = %w(*.eot *.woff *.ttf *.svg *.gif *.jpg *.jpeg *.png common.js deferred.js get_started.js landing.js radar.js seovideo.js shares.js shares/shares_enabled.js shelby.js shelbify.js  mobile.js turbo.js experience.js signup.js png.css print.css screen.css landing.css seovideo.css  experience.css get-started.css mobile.css radar.css signup.css)

  # Disable delivery errors, bad email addresses will be ignored
  # config.action_mailer.raise_delivery_errors = false

  # Enable threaded mode
  # config.threadsafe!

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation can not be found)
  config.i18n.fallbacks = true

  # Send deprecation notices to registered listeners
  config.active_support.deprecation = :notify

  # --- Start of unicorn-worker-killer code ---
  max_request_min =  3072
  max_request_max =  4096

  # Max requests per worker
  config.middleware.use Unicorn::WorkerKiller::MaxRequests, max_request_min, max_request_max

  oom_min = (240) * (1024**2)
  oom_max = (260) * (1024**2)

  # Max memory size (RSS) per worker
  config.middleware.use Unicorn::WorkerKiller::Oom, oom_min, oom_max
  # --- End of unicorn worker-killer-code ---

end
