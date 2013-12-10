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
  Capybara::Poltergeist::Driver.new(app, {phantomjs: '/usr/local/bin/phantomjs', phantomjs_logger: LogKiller, :phantomjs_options => ['--ignore-ssl-errors=yes', '--local-to-remote-url-access=yes']})
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

def sources(quantity=1)
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

def anonymous_user
  {
    "nickname" => "Anonymous"
  }
end

def user
  {
    "avatar_updated_at"   => "2012-10-26 11:49:39 -0400",
    "has_shelby_avatar"   => true,
    "name"                => "Jean Luc Picard",
    "nickname"            => "nickname",
    "user_image_original" => nil,
    "user_image"          => nil,
    "user_type"           => 0,
    "preferences"         => {
      'email_updates'               => "true",
      'comment_notifications'       => "true",
      'like_notifications'          => "true",
      'reroll_notifications'        => "true",
      'roll_activity_notifications' => "true"
    },
    "primary_email"       => "jlpicard@starfleet.com",
    "app_progress" => {"something" => "here"}
  }
end

def creator(quantity=1)
  creators = []

  (1..quantity).each do |index|
    creators << {
      "id"=>"#{index}",
      "creator_id"=>"#{index}#{index}",
      "origin_network"=>"shelby_person",
      "title"=>"lifeandtimes",
      "roll_type"=>15,
      "subdomain"=>"lifeandtimes",
      "creator_nickname"=>"lifeandtimes",
      "creator_name"=>"JayZ",
      "creator_has_shelby_avatar"=>false,
      "creator_avatar_updated_at"=>nil,
      "creator_image_original"=>nil,
      "creator_image"=>"http://i3.ytimg.com/i/N-sc1xJr-QQNj_uNIM9wTA/mq1.jpg",
      "thumbnail_url"=>"http://i.ytimg.com/vi/k-CW3WYMF_Q/0.jpg"
    }
  end

  creators
end

def dbe
end
