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
    "primary_email"       => "jlpicard@starfleet.com"
  }
end

def dbe
  {
    "id"       : "529cb5d759b052171500068b",
    "user_id"  : "508ab05eb415cc777c003e4d",
    "action"   : 1,
    "actor_id" : "4f907a9a9a725b46010005c5",
    "frame"    : {
      "id"                  : "529cb5d559b0523f1902a77d",
      "score"               : 1247.4017111111111,
      "view_count"          : 1,
      "creator_id"          : "4f907a9a9a725b46010005c5",
      "conversation_id"     : "529cb5d559b0523f1902a77b",
      "roll_id"             : "4f907a9b9a725b46010005c7",
      "video_id"            : "529cb5d559b0523f1902a778",
      "upvoters"            : [ ],
      "like_count"          : 0,
      "originator_id"       : null,
      "originator"          : null,
      "created_at"          : "42m ago",
      "creator"             : {
      "has_shelby_avatar"   : false,
      "id"                  : "4f907a9a9a725b46010005c5",
      "name"                : null,
      "nickname"            : "VICE",
      "user_image_original" : "http://graph.facebook.com/167115176655082/picture",
      "user_image"          : "http://graph.facebook.com/167115176655082/picture",
      "user_type"           : 3,
      "public_roll_id"      : "4f907a9b9a725b46010005c7",
      "gt_enabled"          : false,
      "authentications"     : [
        {
        "uid"                 : "167115176655082",
        "provider"            : "facebook",
        "nickname"            : "VICE"
        }
      ]
    },
    "roll" : {
      "id"                        : "4f907a9b9a725b46010005c7",
      "collaborative"             : false,
      "public"                    : true,
      "creator_id"                : "4f907a9a9a725b46010005c5",
      "origin_network"            : "facebook",
      "genius"                    : false,
      "frame_count"               : 475,
      "first_frame_thumbnail_url" : "http://i1.ytimg.com/vi/fANM7Yooiw8/0.jpg",
      "title"                     : "VICE",
      "roll_type"                 : 16,
      "thumbnail_url"             : "http://b.vimeocdn.com/ts/308/025/308025790_960.jpg"
    },
    "video" : {
      "id"                  : "529cb5d559b0523f1902a778",
      "provider_name"       : "youtube",
      "provider_id"         : "fANM7Yooiw8",
      "title"               : "Fresh Off The Boat With Eddie Huang: Moscow (Part 1)",
      "description"         : "In part one of Fresh Off the Boat - Moscow, Eddie takes his first shot of Russian vodka, chows down on some \"communist dogs\" with one of the few black Muscovites, and discusses the country's diverse generation of millennials and their evolving ideologies. Miss out on Season 1? Watch it here! http://bit.ly/Fresh-Off-The-Boat-S1 Buy Eddie's book here! http://www.FreshOffTheBoatBook.com Check out Eddie's blog: http://thepopchef.blogspot.com Follow Eddie on Twitter here: http://twitter.com/MrEddieHuang Subscribe to VICE here! http://bit.ly/Subscribe-to-VICE Check out our full video catalog: http://bit.ly/VICE-Videos Videos, daily editorial and more: http://vice.com Like VICE on Facebook: http://fb.com/vice Follow VICE on Twitter: http://twitter.com/vice Read our tumblr: http://vicemag.tumblr.com",
      "duration"            : "753",
      "author"              : "VICE",
      "thumbnail_url"       : "http://i1.ytimg.com/vi/fANM7Yooiw8/0.jpg",
      "source_url"          : "http://www.youtube.com/watch?v=fANM7Yooiw8&feature=youtube_gdata_player",
      "embed_url"           : "http://www.youtube.com/v/fANM7Yooiw8&feature=youtube_gdata_player",
      "view_count"          : 1,
      "like_count"          : 0,
      "tags"                : [ ],
      "categories"          : [ "Entertainment" ],
      "first_unplayable_at" : null,
      "last_unplayable_at"  : null,
      "recs"                : [ ]
    },
    "conversation" : {
      "id"                     : "529cb5d559b0523f1902a77b",
      "public"                 : true,
      "messages"               : [
        {
          "id"                     : "529cb5d559b0523f1902a77a",
          "nickname"               : "VICE",
          "realname"               : null,
          "user_image_url"         : "http://graph.facebook.com/167115176655082/picture",
          "text"                   : "In part one of Fresh Off the Boat - Moscow, Eddie takes his first shot of Russian vodka, chows down on some \"communist dogs\" with one of the few black Muscovites, and discusses the country's diverse generation of millennials and their evolving ideologies. Miss out on Season 1? Watch it here! http://bit.ly/Fresh-Off-The-Boat-S1 Buy Eddie's book here! http://www.FreshOffTheBoatBook.com Check out Eddie's blog: http://thepopchef.blogspot.com Follow Eddie on Twitter here: http://twitter.com/MrEddieHuang Subscribe to VICE here! http://bit.ly/Subscribe-to-VICE Check out our full video catalog: http://bit.ly/VICE-Videos Videos, daily editorial and more: http://vice.com Like VICE on Facebook: http://fb.com/vice Follow VICE on Twitter: http://twitter.com/vice Read our tumblr: http://vicemag.tumblr.com",
          "origin_network"         : null,
          "origin_id"              : null,
          "origin_user_id"         : null,
          "user_id"                : "4f907a9a9a725b46010005c5",
          "user_has_shelby_avatar" : false,
          "public"                 : true,
          "created_at"             : "42m ago"
        }
      ]
    }
  }
end
