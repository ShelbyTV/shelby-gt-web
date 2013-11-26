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
    end

    it "renders the notifications" do
      @user_preferences = user_preferences

      assign(:preferences, @user_preferences)

      render :template => "mobile/preferences_notifications", :layout => "layouts/mobile"

      rendered.should have_selector('.form_label', @user_preferences.count)

      #TODO: test <label></label> "content"
    end
  end
end
