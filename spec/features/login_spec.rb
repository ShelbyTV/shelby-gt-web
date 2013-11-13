require 'spec_helper'

describe 'Login Process', :type => :feature do

  before(:each) do
    visit('/')
  end

  context 'when initially logged out' do

    it "loads the home page with all necessary elements" do
      page.should have_field('username')
      page.should have_field('password')
      page.should have_button('Log In')
      page.should have_button('Login')
      page.should have_selector('.login-section')
      page.should have_selector('.dropdown_module')
    end

    context 'after hovering over Log In', :js => true do

      before(:each) do
        page.driver.resize(1100,800)
        find('.dropdown_module').hover
      end

      it "reveals the login options" do
        find('.login-section').should be_visible
      end

      context 'when logging in with username and password' do

        it "shows feedback for a failed login" do
          fill_in('username', :with => 'badusername@#$')
          click_button('Login')
          page.should have_content('Please try again')
        end

        it "enters the app after a successful login" do
          fill_in('username', :with => Settings::Acceptance.shelby_user_name)
          fill_in('password', :with => Settings::Acceptance.shelby_password)
          click_button('Login')
          sleep(2)
          page.should have_selector('#js-shelby-wrapper')
        end

      end

    end

  end

end
