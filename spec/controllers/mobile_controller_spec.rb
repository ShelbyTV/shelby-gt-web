require 'spec_helper'

describe MobileController do

  context "logged in" do
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

  context "logged out" do
    before(:each) do
      controller.stub(:check_for_signed_in_user).and_return(anonymous_user)
      controller.stub(:user_signed_in?).and_return(false)
    end


    describe "GET 'notifications'" do

      it 'redirects from notifications to the mobile_landing_path' do
        get :notifications

        response.should be_redirect
        response.should redirect_to mobile_landing_path(:status => Settings::ErrorMessages.not_logged_in)
      end

    end

    describe "GET 'profile'" do

      it 'redirects from profile to the mobile_landing_path' do
        get :preferences, :section => "profile"

        response.should be_redirect
        response.should redirect_to mobile_landing_path(:status => Settings::ErrorMessages.not_logged_in)
      end

    end

  end

end
