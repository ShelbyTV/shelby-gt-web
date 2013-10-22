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
      post :send_message
      response.status.should == 500
      response.body.should have_json_path('message')
      parse_json(response.body)["message"].should == "You must specify a valid message type"
    end

    it "parses the to param" do
      post :send_message, :to => "123-456-7890"
      assigns(:to).should == "123-456-7890"
    end

    it "parses the type param" do
      post :send_message, :type => 1
      assigns(:message_type).should == 1
    end

    context "valid parameters, message type 1" do
      before(:each) do
        Twilio::REST::Client.should_receive(:new).with(Settings::Twilio.account_sid, Settings::Twilio.auth_token).and_return(@twilio_client)
      end

      it "parses params and sends a text message" do
        @messages_endpoint.should_receive(:create).with({
          :from => Settings::Twilio.from_number,
          :to => "123-456-7890",
          :body => "Install the Shelby.tv app"
        })
        post :send_message, :to => "123-456-7890", :type => 1
        response.status.should == 200
      end

      it "returns a 500 status on failure" do
        @messages_endpoint.should_receive(:create).with({
          :from => Settings::Twilio.from_number,
          :to => "123-456-7890",
          :body => "Install the Shelby.tv app"
        }).and_raise(StandardError)
        post :send_message, :to => "123-456-7890", :type => 1
        response.status.should == 500
      end
    end

  end

end
