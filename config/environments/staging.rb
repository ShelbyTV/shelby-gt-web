require "yui/compressor"

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

  # Use a different cache store in staging
  # config.cache_store = :mem_cache_store

  # Enable serving of images, stylesheets, and JavaScripts from an asset server
  #config.action_controller.asset_host = "//staging.shelby.tv"

  # Precompile additional assets (application.js, application.css, image files must be included if they're going to be cache-busted)
  config.assets.precompile = %w(*.eot *.woff *.ttf *.svg *.gif *.jpg *.jpeg *.png common.js deferred.js landing.js seovideo.js shares.js shares/shares_enabled.js shelby.js shelbify.js extension/includes.js mobile.js turbo.js experience.js signup.js radar.js syntax.js png.css print.css screen.css landing.css seovideo.css extension.css experience.css mobile.css signup.css radar.css styleguide.css syntax.css)

  # Disable delivery errors, bad email addresses will be ignored
  # config.action_mailer.raise_delivery_errors = false

  # Enable threaded mode
  # config.threadsafe!

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation can not be found)
  config.i18n.fallbacks = true

  # Send deprecation notices to registered listeners
  config.active_support.deprecation = :notify

end
