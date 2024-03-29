 require 'spec_helper'

describe 'Go to Home Page', :type => :feature do

  before(:each) do
    visit('/')
  end

  context 'when initially logged out' do
    context 'after clicking the User Login button', :js => true do
      # before(:each) do
      #   click_button('js-gate-login')
      # end

      # it "should reveal login options" do
      #   page.should have_selector('#username', :visible => true)
      #   page.should have_selector('#password', :visible => true)
      #   page.should have_selector('.gate-networks-twitter', :visible => true)
      #   page.should have_selector('.gate-networks-facebook', :visible => true)
      # end

      # context 'when logging in with username and password' do

      #   it "should show feedback for a failed login" do
      #     fill_in('username', :with => 'badusername@#$')
      #     click_button('Login')
      #     page.should have_content('Please try again')
      #   end

      #   it "should enter the app after a successful login" do
      #     fill_in('username', :with => Settings::Acceptance.shelby_user_name)
      #     fill_in('password', :with => Settings::Acceptance.shelby_password)
      #     click_button('Login')
      #     page.should have_selector('#js-shelby-wrapper')
      #   end

      # end

      # context 'when logging in with twitter' do

      #   xit "should enter the app after a successful login" do
      #     click_link('Twitter')
      #     fill_in('username_or_email', :with => Settings::Acceptance.twitter_user_name)
      #     fill_in('password', :with => Settings::Acceptance.twitter_password)
      #     click_button('Sign In')
      #     visit '/'
      #     page.should have_selector('#js-shelby-wrapper')
      #   end

      # end

      # context 'when clicking Not a Beta User' do

      #   it "should reveal interest form" do
      #     click_link('js-no-access')
      #     page.should have_selector('#js-email-input', :visible => true)
      #     page.should have_selector('#js-token-input', :visible => true)
      #     page.should have_selector('#js-email-submit', :visible => true)
      #   end

      # end

    end
  end

  context 'selects CTA', :js => true do
    it 'loads the proper components' do
      page.should have_selector('.js')
    end

  # it 'from an iOS device' do
  #   page.driver.headers = { "User-Agent" => Settings::Acceptance.ua_safari_mobile }
  #   find('#js-cta--main').click
  # end

  # it 'from a non-iOS device' do
  #   page.driver.headers = { "User-Agent" => Settings::Acceptance.ua_android_nexus }
  #   find('#js-cta--main').click
  #   page.should have_content(Settings::Marketing.cta_button)
  # end

  # context 'and fills out the SMS form' do
  #   before(:each) do
  #     find('#js-cta--main').click
  #   end

  #   it 'successfully' do
  #     fill_in('sms', :with => '9178285740')
  #     click_on('Send')
  #     sleep(5)
  #     find('.js-sms-success').should be_visible
  #   end

  #   it 'unsuccessfully' do
  #     fill_in('sms', :with => 'invalidphonenumber')
  #     click_on('Send')
  #     sleep(5)
  #     page.has_css?('.form_fieldset--error')
  #   end
  # end

  end
end
