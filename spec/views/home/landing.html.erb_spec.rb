require 'spec_helper'

describe "home/landing" do

  context "team page" do
    before(:all) do
      assign(:team,:true)
    end

    describe "home/shelf/team" do
      it "renders the correct number of employees" do
        render
        rendered.should have_selector('.member', :count => Settings::Team.members.count)
      end
    end
  end

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

      context "logged in" do
        before(:all) do
          assign(:user_signed_in, :true)
        end

        it "doesn't have a CTA button" do
          render
          rendered.should_not =~ /#{Settings::Marketing.cta_button_short}/
        end
      end

      context "logged out" do
        before(:all) do
          assign(:user_signed_in, nil)
        end

        it "has a CTA button" do
          render
          rendered.should =~ /#{Settings::Marketing.cta_button_short}/
        end
      end
    end
  end

  context "main call to action shelf" do
    describe "home/shelf/call_to_action" do
      context "renders the main 'call to action' for web and mobile web" do
        before(:all) do
          assign(:mobile_os,nil)
        end

        it "renders the CTA with the App Store url" do
          render
          #CTA should point to the App Store
          #and use the Marketing button copy
          rendered.should =~ /#{Settings::Application.ios_app_url}/
          rendered.should =~ /#{Settings::Marketing.cta}/
        end

        it "renders the proper copy from marketing.yml" do
          render
          rendered.should =~ /#{Settings::Marketing.cta_body}/
          rendered.should =~ /#{Settings::Marketing.cta_button}/
          rendered.should =~ /#{Settings::Marketing.cta_alternative_button}/
        end
      end
    end
  end

  context "social networks shelf" do
    describe "home/shelf/social" do
      context "renders the main 'call to action' for web and mobile web" do
        before(:all) do
          assign(:mobile_os,nil)
        end

        it "renders the proper copy from marketing.yml" do
          render
          #use marketing.yml for copy
          rendered.should =~ /#{Settings::Marketing.social}/
          rendered.should =~ /#{Settings::Marketing.social_body}/
        end
      end
    end
  end

  context "stream shelf" do
    describe "home/shelf/social" do
      context "the main 'call to action' for web and mobile web" do
        it "renders the proper copy from marketing.yml" do
          render
          rendered.should =~ /#{Settings::Marketing.stream}/
          rendered.should =~ /#{Settings::Marketing.stream_body}/
        end
      end
    end
  end

  context"apps shelf" do
    describe "home/shelf/apps" do
      context "the main area to 'download' the apps" do
        it "renders the proper buttons" do
          render
          rendered.should =~ /#{Settings::Marketing.badge['ios']['href']}/
          rendered.should =~ /#{Settings::Marketing.badge['amazon']['href']}/
          rendered.should =~ /#{Settings::Marketing.badge['windows']['href']}/
        end

        it "renders the proper headline and sub-headline" do
          render
          rendered.should =~ /#{Settings::Marketing.apps}/
          rendered.should =~ /#{Settings::Marketing.cta_body}/
        end
      end
    end
  end


end

