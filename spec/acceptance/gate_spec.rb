require 'spec_helper'

describe 'Index', :type => :request do
  before(:each) do
    visit '/'
  end

  context 'when logged out' do
    it "should load the gate page" do
      page.should have_field('js-email-input')
      page.should have_field('js-token-input')
      page.should have_button('js-email-submit')
      page.should have_button('js-gate-login')
    end

    it "should give success feedback when submitting interest email", :js => true do
      fill_in('js-email-input', :with => 'josh@shelby.tv')
      click_button('js-email-submit')
      page.should have_selector('#js-thankyou', :visible => true)
    end

    context 'when clicking the User Login button', :js => true do

    before(:each) do
      click_button('js-gate-login')
    end

    it "should reveal login options" do
      page.should have_selector('#username', :visible => true)
      page.should have_selector('#password', :visible => true)
      page.should have_selector('.gate-networks-twitter', :visible => true)
      page.should have_selector('.gate-networks-facebook', :visible => true)
    end

    it "should reveal interest form when clicking Not a Beta User" do
      click_link('js-no-access')
      page.should have_selector('#js-email-input', :visible => true)
      page.should have_selector('#js-token-input', :visible => true)
      page.should have_selector('#js-email-submit', :visible => true)
    end

    end
  end

end