require 'spec_helper'

describe "/m/preferences/sources" do

  it "infers the controller path" do
    controller.request.path_parameters[:controller].should eq("/m/preferences")
  end

  it "infers the action path" do
    controller.request.path_parameters[:action].should eq("sources")
  end

  context "when page is visited" do
    before(:each) do
      view.stub(:csrf_token_from_cookie).and_return(true)
      view.stub(:signed_in_user).and_return(user_signed_in)
      assign(:signed_in_user, user)
    end

    it "renders the sources" do
      assign(:sources, sources(2))
      render :template => "mobile/preferences_sources", :layout => "layouts/mobile"
      rendered.should have_selector('.user', :count => 2)
    end
  end
end
