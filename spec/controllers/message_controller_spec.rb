require 'spec_helper'

describe MessageController do

  describe "POST 'send'" do
    before(:each) do
      @twilio_client = double("twilio_client")
      @messages_endpoint = double("messages_endpoint", :create => Object.new)
      @twilio_client.stub_chain(:account, :sms, :messages).and_return(@messages_endpoint)
      Twilio::REST::Client.stub(:new).and_return(@twilio_client)
    end

    it "returns http success" do
      post :send_message
      response.should be_success
      puts response.inspect
    end

    it "parses the to param" do
      post :send_message, :to => "123-456-7890"
      assigns(:to).should == "123-456-7890"
    end

    context "valid parameters" do
      before(:each) do
        Twilio::REST::Client.should_receive(:new).with(Settings::Twilio.twilio_account_sid, Settings::Twilio.twilio_auth_token).and_return(@twilio_client)
      end

      it "parses params and sends a text message" do
        @messages_endpoint.should_receive(:create).with({
          :from => Settings::Twilio.twilio_outgoing_number,
          :to => "123-456-7890",
          :body => "Install the Shelby.tv app"
        })
        post :send_message, :to => "123-456-7890"
        response.status.should == 200
      end

      it "returns a 500 status on failure" do
        @messages_endpoint.should_receive(:create).with({
          :from => Settings::Twilio.twilio_outgoing_number,
          :to => "123-456-7890",
          :body => "Install the Shelby.tv app"
        }).and_raise(StandardError)
        post :send_message, :to => "123-456-7890"
        response.status.should == 500
      end
    end

  end

end
