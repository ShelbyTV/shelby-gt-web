require 'spec_helper'

describe "/m/stream" do

  it "infers the controller path" do
    controller.request.path_parameters[:controller].should eq("/m")
  end

  it "infers the action path" do
    controller.request.path_parameters[:action].should eq("stream")
  end

  context "when page is visited" do
    before(:each) do
      view.stub(:csrf_token_from_cookie).and_return(true)
      view.stub(:signed_in_user).and_return(true)
      assign(:signed_in_user, user)
      assign(:user, user)
    end

    it "renders the /objects/frame for each frame" do
      assign(:dashboard, dbe(2))
      assign(:roll_type, Settings::Mobile.roll_types.stream)
      assign(:page,1)

      render :template => "mobile/stream", :layout => "layouts/mobile"

      rendered.should have_selector('.frame', :count => 2)
    end
  end
end
