require 'spec_helper'

describe HomeController do

  context "logged in" do
    before(:each) do
      controller.stub(:check_for_signed_in_user).and_return(user)
      controller.stub(:user_signed_in?).and_return(true)
    end


    describe "GET 'bookmarklet'" do

      it 'without video parameters' do
        get :bookmarklet

        response.should be_success
        response.should render_template "home/bookmarklet"
      end

    end

  end

  context "logged out" do
    before(:each) do
      controller.stub(:check_for_signed_in_user).and_return(anonymous_user)
      controller.stub(:user_signed_in?).and_return(false)
    end


    describe "GET 'bookmarklet'" do

      it 'redirects to a login page' do
        pending('I am moving too fast for this test.')
      end

    end

  end

end
