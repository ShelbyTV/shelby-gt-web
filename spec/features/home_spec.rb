require 'spec_helper'

describe 'Home Page', :type => :feature do
  before(:each) do
    visit('/')
  end

  context 'when initially logged out' do

    it "loads the home page with all the necessary elements" do
      page.should have_selector('.shelby__head')
      page.should have_selector('.shelby__wrapper')
      page.should have_selector('.shelby__foot')
    end

  end

end