require 'spec_helper'

describe 'Gate', :type => :request do
  before(:each) do
    visit '/'
  end

  context 'when initially logged out' do
    it "should load the gate page" do
      page.should have_field('js-email-input')
      page.should have_field('js-token-input')
      page.should have_button('js-email-submit')
      page.should have_button('js-gate-login')
    end

    it "should give success feedback when submitting interest email", :js => true do
      fill_in('js-email-input', :with => Settings::Acceptance.user_interest_email)
      click_button('js-email-submit')
      page.should have_selector('#js-thankyou', :visible => true)
    end

    context 'after clicking the User Login button', :js => true do

      before(:each) do
        click_button('js-gate-login')
      end

      it "should reveal login options" do
        page.should have_selector('#username', :visible => true)
        page.should have_selector('#password', :visible => true)
        page.should have_selector('.gate-networks-twitter', :visible => true)
        page.should have_selector('.gate-networks-facebook', :visible => true)
      end

      context 'when logging in with username and password' do

        it "should show feedback for a failed login" do
          fill_in('username', :with => 'badusername@#$')
          click_button('Login')
          page.should have_content('Please try again')
        end

        it "should enter the app after a successful login" do
          fill_in('username', :with => Settings::Acceptance.shelby_user_name)
          fill_in('password', :with => Settings::Acceptance.shelby_password)
          click_button('Login')
          page.should have_selector('#js-shelby-wrapper')
        end

      end

      context 'when logging in with twitter' do

        xit "should enter the app after a successful login" do
          click_link('Twitter')
          fill_in('username_or_email', :with => Settings::Acceptance.twitter_user_name)
          fill_in('password', :with => Settings::Acceptance.twitter_password)
          click_button('Sign In')
          visit '/'
          page.should have_selector('#js-shelby-wrapper')
        end

      end

      context 'when clicking Not a Beta User' do

        it "should reveal interest form" do
          click_link('js-no-access')
          page.should have_selector('#js-email-input', :visible => true)
          page.should have_selector('#js-token-input', :visible => true)
          page.should have_selector('#js-email-submit', :visible => true)
        end

    end

    end
  end

end