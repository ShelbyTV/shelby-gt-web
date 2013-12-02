require 'spec_helper'

describe MobileController do

  context "preferences" do
    before(:each) do
      controller.stub(:check_for_signed_in_user).and_return(user)
      controller.stub(:user_signed_in?).and_return(true)
    end


    describe "GET 'notifications'" do

      it 'loads successfully, loads the proper template' do
        get :notifications, user['preferences']

        response.should be_success
        response.should render_template "preferences_notifications"
      end

    end

    describe "POST 'notifications'" do

      it "when it receives the expected params" do
        post :notifications, user['preferences']

        response.should be_success
        response.should render_template "preferences_notifications"
      end

    end

    describe "GET 'profile'" do

      it "renders the profile template" do
        get :preferences, :section => "profile"

        response.should be_success
        response.should render_template "preferences_profile"
      end

    end

  end

end
