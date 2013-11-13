require 'spec_helper'

describe 'Go to Home Page', :type => :feature do

  before(:each) do
    visit('/')
  end

  context 'selects CTA', :js => true do
    it 'loads the proper components' do
      page.should have_selector('.js')
    end

    it 'from an iOS device' do
      page.driver.headers = { "User-Agent" => Settings::Acceptance.ua_safari_mobile }
      find('#js-cta--main').click
    end

    it 'from a non-iOS device' do
      page.driver.headers = { "User-Agent" => Settings::Acceptance.ua_android_nexus }
      find('#js-cta--main').click
      page.should have_content('Text iOS download link to your phone:')
    end

    context 'and fills out the SMS form' do
      before(:each) do
        find('#js-cta--main').click
      end

      xit 'successfully' do
        fill_in('sms', :with => '9178285740')
        click_on('Send')
        sleep(5)
        # page.should have_content('SMS Message Sent!')
        find('.js-sms-success').should be_visible
      end

      xit 'unsuccessfully' do
        fill_in('sms', :with => 'invalidphonenumber')
        click_on('Send')
        sleep(5)
        # page.should have_content('There was a problem sending you a text message, please try again!')
        find('.js-sms-success').should be_visible
      end
    end

  end
end
