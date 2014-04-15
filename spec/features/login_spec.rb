require 'spec_helper'

describe 'Login Process', :type => :request do

  before(:each) do
    visit('/')
  end

  context 'when initially logged out', :js => true do
    it "loads the home page with all necessary elements" do
      page.should have_selector(:link_or_button, 'Login', :visible => false)
      page.should have_field('username', :visible => false)
      page.should have_field('password', :visible => false)
      page.should have_link('Log In', :visible => false)
      page.should have_selector('.login-section', :visible => false)
      page.should have_selector('.js-dropdown_module')
    end

  #   context 'after hovering over Log In', :pending do

  #     before(:each) do
  #       page.driver.resize(1200,800)
  #       find('.js-dropdown_module').hover
  #     end

  #     it "reveals the login options" do
  #       find('.login-section').should be_visible
  #     end

  #     context 'when logging in with username and password' do

  #       xit "shows feedback for a failed login" do
  #         fill_in('username', :with => 'badusername@#$')
  #         click_button('Login')
  #         page.should have_content('Please try again')
  #       end

  #       xit "enters the app after a successful login" do
  #         fill_in('username', :with => Settings::Acceptance.shelby_user_name)
  #         fill_in('password', :with => Settings::Acceptance.shelby_password)
  #         click_button('Login')
  #         sleep(2)
  #         page.should have_selector('#js-shelby-wrapper')
  #       end

  #     end

  #     context 'when logging in with twitter' do

  #       xit "should enter the app after a successful login" do
  #         click_link('Twitter')
  #         fill_in('username_or_email', :with => Settings::Acceptance.twitter_user_name)
  #         fill_in('password', :with => Settings::Acceptance.twitter_password)
  #         click_button('Sign In')
  #         visit '/'
  #         page.should have_selector('#js-shelby-wrapper')
  #       end

  #     end

  #     context 'when clicking Not a Beta User' do

  #       it "should reveal interest form" do
  #         click_link('js-no-access')
  #         page.should have_selector('#js-email-input', :visible => true)
  #         page.should have_selector('#js-token-input', :visible => true)
  #         page.should have_selector('#js-email-submit', :visible => true)
  #       end

  #     end



  #   end

  end

end
