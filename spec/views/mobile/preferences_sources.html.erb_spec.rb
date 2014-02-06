require 'spec_helper'

describe "/m/preferences/channels" do

  it "infers the controller path" do
    controller.request.path_parameters[:controller].should eq("/m/preferences")
  end

  it "infers the action path" do
    controller.request.path_parameters[:action].should eq("channels")
  end

  context "when page is visited" do
    before(:each) do
      view.stub(:csrf_token_from_cookie).and_return(true)
      view.stub(:signed_in_user).and_return(true)
      assign(:signed_in_user, user)
    end

    it "renders the channels" do
      @quantity = 2
      assign(:sources, sources(@quantity))
      render :template => "mobile/preferences_sources", :layout => "layouts/mobile"
      rendered.should have_selector('.user', :count => @quantity)
    end
  end
end
