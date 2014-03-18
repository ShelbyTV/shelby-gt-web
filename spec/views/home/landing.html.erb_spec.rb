require 'spec_helper'

describe "home/landing" do

  context "landing header" do
    before(:all) do
      assign(:mobile_os,nil)
    end

    describe "home/landing_header" do
      it "has the logo" do
        render
        rendered.should have_selector('.shelby_logo')
      end

      it "renders the login form" do
        render
        rendered.should =~ /#{Settings::ShelbyAPI.login_form_url}/
        rendered.should =~ /#{Settings::ShelbyAPI.url}\/auth\/twitter/
        rendered.should =~ /#{Settings::ShelbyAPI.url}\/auth\/facebook/
        rendered.should =~ /#{Settings::ShelbyAPI.url}\/user\/password\/new/
      end
    end
  end

  context "main call to action" do
    describe "home/shelf/call_to_action" do
      context "renders the main 'call to action' for amazon kindle" do
        before(:all) do
          assign(:mobile_os,:amazon)
        end

        it "renders the CTA with the amazon-specific url" do
          render
          #amazon view uses a form with the route /user/create
          rendered.should have_selector('.js-get-started-form')
          rendered.should =~ /user\/create/
        end
      end

      context "renders the main 'call to action' for web and mobile web" do
        before(:all) do
          assign(:mobile_os,nil)
        end

        it "renders the CTA with the App Store url" do
          render
          #CTA should point to the App Store
          #and use the Marketing button copy
          rendered.should =~ /#{Settings::Marketing.cta_button}/
          rendered.should =~ /#{Settings::Application.ios_app_url}/
        end
      end
    end
  end

end

