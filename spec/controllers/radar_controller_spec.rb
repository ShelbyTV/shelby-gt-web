require 'spec_helper'

describe RadarController do

  context "logged in" do
    before(:each) do
      controller.stub(:check_for_signed_in_user).and_return(user)
      controller.stub(:user_signed_in?).and_return(true)
    end


    describe "GET 'index'" do

      it 'loads the radar template successfully' do
        get :index

        response.should be_success
        response.should render_template "index"
      end

      context "parses params" do

        it "parses multiple video_ids" do
          get :index, { :video_ids => "52c2d8f088ba6b351b6a5cce,52c28dc31c1cf475db130763"}
          response.should be_success
        end

      end

    end

  end

  context "logged out" do
    before(:each) do
      controller.stub(:check_for_signed_in_user).and_return(anonymous_user)
      controller.stub(:user_signed_in?).and_return(false)
    end


    describe "GET 'index'" do

      xit 'redirects to a login page' do
      end

    end

  end

end
