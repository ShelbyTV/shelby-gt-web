require 'spec_helper'

describe 'Home Page', :type => :feature do

  context 'when device is a laptop or a desktop' do

    before(:each) do
      visit('/')
    end

    context 'when initially logged out' do

      it 'loads the home page with all the necessary elements' do
        page.should have_selector('.shelby__head')
        page.should have_selector('.shelby__wrapper')
        page.should have_selector('.shelby__foot')
      end

    end

  end

  context 'when device is a mobile phone' do

    context 'on an iphone using safari' do

      before(:each) do
        page.driver.browser.header('User-Agent', Settings::Acceptance.ua_safari_mobile)
        visit('/')
      end

      it 'loads the mobile layout for ios users' do
        page.should have_selector('.shelby--mobile')
      end

    end

    context 'on an android mobile device' do

      before(:each) do
        page.driver.browser.header('User-Agent', Settings::Acceptance.ua_android_nexus)
        visit('/')
      end

      it 'loads the mobile layout for non-ios users' do
        page.should have_selector('.shelby--mobile')
      end

    end

  end

end
