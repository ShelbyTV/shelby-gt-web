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
      # suspect that rspec's assign method doesn't deep clone… or stringifies things inappropriately.
      assign(:preferences, {
        :email_updates               => "true",
        :like_notifications          => "true",
        :reroll_notifications        => "true",
        :comment_notifications       => "true",
        :roll_activity_notifications => "true"
      })

      render :template => "mobile/preferences_notifications", :layout => "layouts/mobile"
    end
  end
end
