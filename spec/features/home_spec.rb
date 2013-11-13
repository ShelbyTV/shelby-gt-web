require 'spec_helper'

describe 'Go to Home Page', :type => :feature do

  before(:each) do
    visit('/')
  end

  context 'select CTA', :js => true do
    it 'loads the proper components' do
      page.should have_selector('.js')
    end

    it 'from an iOS device' do
      page.driver.headers = { "User-Agent" => Settings::Acceptance.ua_safari_mobile }
      within('#intro') do
        click_link(Settings::Marketing.cta_button)
      end
    end

    it 'from a non-iOS device' do
      page.driver.headers = { "User-Agent" => Settings::Acceptance.ua_android_nexus }
      within('#intro') do
        click_link(Settings::Marketing.cta_button)
        find('.js-popup--sms').should be_visible
      end
    end
  end
end
