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
      assign(:dashboard, dbe(2))
      assign(:roll_type, Settings::Mobile.roll_types.stream)
      assign(:page,1)
    end

    context "real user" do
      before(:each) do
        assign(:signed_in_user, user)
        assign(:user, user)
      end

      it "renders the /objects/frame for each frame" do
        render :template => "mobile/stream", :layout => "layouts/mobile"

        rendered.should have_selector('.frame', :count => 2)
      end

    end

    context "anonymous user with less than #{Settings::User.anon_banner_session_count} sessions" do
      before(:each) do
        assign(:signed_in_user, user_type_anonymous)
        assign(:user, user_type_anonymous)
      end

      it "shows the inline cta for authenticating social networks" do
        render :template => "mobile/stream", :layout => "layouts/mobile"

        rendered.should have_selector('.frame--social_cta')
      end

      it "shows the inline cta for adding sources" do
        render :template => "mobile/stream", :layout => "layouts/mobile"

        rendered.should have_selector('.frame--sources_cta')
      end
    end

    context "anonymous user with more than #{Settings::User.anon_banner_session_count} sessions" do
      before(:each) do
        assign(:signed_in_user, user_type_anonymous({:session => Settings::User.anon_banner_session_count}))
        assign(:user, user_type_anonymous({:session => Settings::User.anon_banner_session_count}))
      end

      it "shows the inline cta for authenticating social networks" do
        render :template => "mobile/stream", :layout => "layouts/mobile"

        rendered.should_not have_selector('.frame--social_cta')
      end

      it "shows the inline cta for adding sources" do
        render :template => "mobile/stream", :layout => "layouts/mobile"

        rendered.should_not have_selector('.frame--sources_cta')
      end
    end

  end

end
