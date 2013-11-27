require 'spec_helper'

describe "/m/preferences/notifications" do

  it "infers the controller path" do
    controller.request.path_parameters[:controller].should eq("/m/preferences")
  end

  it "infers the action path" do
    controller.request.path_parameters[:action].should eq("notifications")
  end

  context "when page is visited" do
    before(:each) do
      view.stub(:csrf_token_from_cookie).and_return(true)
      assign(:signed_in_user,user)

      @user_preferences = user['preferences']
      assign(:preferences, @user_preferences)

      render :template => "mobile/preferences_notifications", :layout => "layouts/mobile"
    end

    it "renders the expected number of notification settings" do
      rendered.should have_selector('label', Settings::Mobile.email_notifications.count)
    end

    it "renders the labels with the expected descriptions" do
      Settings::Mobile.email_notifications.each do |notification,label|
        rendered.should =~ /#{label}/
      end
    end
  end
end
