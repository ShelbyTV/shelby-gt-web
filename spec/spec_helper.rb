# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../../config/environment", __FILE__)
require 'rspec/rails'
require 'rspec/autorun'
require 'capybara/rails'
require 'capybara/rspec'
require 'capybara/poltergeist'

include ApplicationHelper

#BEGIN bunch of crap to silence annoying CoreText warnings on Mac OS X Mavericks
module Capybara::Poltergeist
  class Client
    private
    def redirect_stdout
      prev = STDOUT.dup
      prev.autoclose = false
      $stdout = @write_io
      STDOUT.reopen(@write_io)

      prev = STDERR.dup
      prev.autoclose = false
      $stderr = @write_io
      STDERR.reopen(@write_io)
      yield
    ensure
      STDOUT.reopen(prev)
      $stdout = STDOUT
      STDERR.reopen(prev)
      $stderr = STDERR
    end
  end
end

class WarningSuppressor
  class << self
    def write(message)
      if message =~ /QFont::setPixelSize: Pixel size <= 0/ || message =~/CoreText performance note:/ then 0 else puts(message);1;end
    end
  end
end

class LogKiller
  class << self
    def write(message)
      0
    end
  end
end
#END bunch of crap to silence annoying CoreText warnings on Mac OS X Mavericks

#NOTE: Switch from LogKiller to WarningSuppressor as the :phantomjs_logger if you want to see console.log output and other debug output
# => from phantomjs
Capybara.register_driver :poltergeist_custom do |app|
  Capybara::Poltergeist::Driver.new(app, {phantomjs_logger: LogKiller, :phantomjs_options => ['--ignore-ssl-errors=yes', '--local-to-remote-url-access=yes']})
end

Capybara.javascript_driver = :poltergeist_custom

# Requires supporting ruby files with custom matchers and macros, etc,
# in spec/support/ and its subdirectories.
Dir[Rails.root.join("spec/support/**/*.rb")].each {|f| require f}

RSpec.configure do |config|
  # ## Mock Framework
  #
  # If you prefer to use mocha, flexmock or RR, uncomment the appropriate line:
  #
  # config.mock_with :mocha
  # config.mock_with :flexmock
  # config.mock_with :rr

  # use helpers included with json_spec gem:
  config.include JsonSpec::Helpers

  # Remove this line if you're not using ActiveRecord or ActiveRecord fixtures
  # config.fixture_path = "#{::Rails.root}/spec/fixtures"

  # If you're not using ActiveRecord, or you'd prefer not to run each of your
  # examples within a transaction, remove the following line or assign false
  # instead of true.
  # config.use_transactional_fixtures = true

  # If true, the base class of anonymous controllers will be inferred
  # automatically. This will be the default behavior in future versions of
  # rspec-rails.
  config.infer_base_class_for_anonymous_controllers = false
end

def sources(quantity)
  cards = []

  (1..quantity).each do |index|
    cards << {
      :display_thumbnail_src => "avatar-#{index}.png",
      :display_title => "Roll Title #{index}",
      :description => "This is the #{index} description",
      :id => "#{index}234abcd"
    }
  end

  cards
end

def user
  {
    :nickname => "nickname"
  }
end

def user_signed_in
  true
end
