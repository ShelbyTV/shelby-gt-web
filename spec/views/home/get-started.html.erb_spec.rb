require 'spec_helper'

describe "home/get-started" do

  context "logged out" do
    describe "index" do
      it "uses the proper style overrides" do
        render
        rendered.should have_selector('.shelby--get-started')
      end

      it "uses the proper headline" do
        render
        rendered.should =~ /#{Settings::Marketing.discover_love}/
      end

      it "has a 'get started' button that creates a user" do
        render
        #amazon view uses a form with the route /user/create
        rendered.should have_selector('.js-get-started-form')
        rendered.should =~ /user\/create/
      end

      it "has a 'log in' button that brings user to the login screen" do
        render
        rendered.should =~ /\/log_in/
      end
    end
  end

end

