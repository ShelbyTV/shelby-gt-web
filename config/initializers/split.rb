Split.configure do |config|
  config.enabled = Settings::Split.enabled
end

Split.redis = Settings::Split.redis_string