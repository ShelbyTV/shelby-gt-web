require 'spec_helper'

describe 'Login Process', :type => :feature, :js => true do

  before(:each) do
    visit('/')
  end

  context 'when initially logged out' do

    xit "loads the home page with all necessary elements" do
      pending('Capybara is a pain in the ass.')
      page.should have_field('username')
      page.should have_field('password')
      page.should have_link('Log In')
      page.should have_button('Login')
      page.should have_selector('.login-section')
      page.should have_selector('.js-dropdown_module')
    end

    context 'after hovering over Log In' do

      before(:each) do
        page.driver.resize(1200,800)
        find('.js-dropdown_module').hover
      end

      xit "reveals the login options" do
        find('.login-section').should be_visible
      end

      context 'when logging in with username and password' do

        xit "shows feedback for a failed login" do
          fill_in('username', :with => 'badusername@#$')
          click_button('Login')
          page.should have_content('Please try again')
        end

        xit "enters the app after a successful login" do
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
