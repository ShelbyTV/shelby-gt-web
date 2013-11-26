require 'spec_helper'
# require 'json'

describe MobileController do

  #unit vs. functional

  describe "POST 'notifications'" do
    before(:each) do
      @user = {
        :nickname => "Username",
        :preferences => {
          :email_updates               => "true",
          :like_notifications          => "true",
          :reroll_notifications        => "true",
          :comment_notifications       => "true",
          :roll_activity_notifications => "true"
        }
      }
      controller.stub(:check_for_signed_in_user).and_return(@user)
      controller.stub(:user_signed_in?).and_return(true)
    end

    #should_receive, should be called and should receive the "following arguments"
    it "when there are the expected params" do
      post :notifications, user_preferences
    end

  end

end
