require 'spec_helper'
require 'json'

describe MessageController do

  describe "POST 'send'" do
    before(:each) do
      @twilio_client = double("twilio_client")
      @messages_endpoint = double("messages_endpoint", :create => Object.new)
      @twilio_client.stub_chain(:account, :sms, :messages).and_return(@messages_endpoint)
      Twilio::REST::Client.stub(:new).and_return(@twilio_client)
    end

    it "returns 500 if no type is specified" do
      get :send_message
      response.status.should == 500
      response.body.should have_json_path('message')
      parse_json(response.body)["message"].should == "You must specify a valid message type"
    end

    context "parses the to param" do
      it "adds a +1 if the number starts with anything other than + or 1" do
        get :send_message, :to => "012-345-6789"
        assigns(:to).should == "+1012-345-6789"
      end

      it "adds a + if the number starts with a 1" do
        get :send_message, :to => "1012-345-6789"
        assigns(:to).should == "+1012-345-6789"
      end

      it "passes the number through untouched if it starts with a +" do
        get :send_message, :to => "+42111111111"
        assigns(:to).should == "+42111111111"
      end

    end

    it "parses the type param" do
      get :send_message, :type => 1
      assigns(:message_type).should == 1
    end

    context "valid parameters, message type 1" do
      before(:each) do
        Twilio::REST::Client.should_receive(:new).with(Settings::Twilio.account_sid, Settings::Twilio.auth_token).and_return(@twilio_client)
      end

      it "parses params and sends a text message" do
        @messages_endpoint.should_receive(:create).with({
          :from => Settings::Twilio.from_number,
          :to => "+1012-345-6789",
          :body => "#{Settings::Twilio.appstore_install_message} #{Settings::Application.ios_app_url}"
        })
        get :send_message, :to => "012-345-6789", :type => 1
        response.status.should == 200
      end

      it "returns a 500 status on failure" do
        @messages_endpoint.should_receive(:create).with({
          :from => Settings::Twilio.from_number,
          :to => "+1012-345-6789",
          :body => "#{Settings::Twilio.appstore_install_message} #{Settings::Application.ios_app_url}"
        }).and_raise(StandardError)
        get :send_message, :to => "012-345-6789", :type => 1
        response.status.should == 500
      end
    end

  end

end
