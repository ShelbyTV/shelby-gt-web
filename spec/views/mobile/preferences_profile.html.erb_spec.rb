require 'spec_helper'

describe "/m/preferences/profile" do

  it "infers the controller path" do
    controller.request.path_parameters[:controller].should eq("/m/preferences")
  end

  it "infers the action path" do
    controller.request.path_parameters[:action].should eq("profile")
  end

  context "when page is visited" do
    before(:each) do
      view.stub(:csrf_token_from_cookie).and_return(true)
      view.stub(:signed_in_user).and_return(true)
      assign(:signed_in_user, user)
      assign(:user, user)
    end

    it "renders the user's profile" do
      render :template => "mobile/preferences_profile", :layout => "layouts/mobile"
      rendered.should have_content user['email']
      rendered.should have_content user['name']
      rendered.should have_content user['nickname']
    end

    it "renders an error for an occupied nickname" do
      flash[:errors_nickname] = "has already been taken"

      render :template => "mobile/preferences_profile", :layout => "layouts/mobile"
      rendered.should have_content "Username has already been taken"
    end

    it "renders an error for an occupied nickname" do
      flash[:errors_primary_email] = "has already been taken"

      render :template => "mobile/preferences_profile", :layout => "layouts/mobile"
      rendered.should have_content "Email has already been taken"
    end
  end
end
