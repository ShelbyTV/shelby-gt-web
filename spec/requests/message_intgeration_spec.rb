require 'spec_helper'

describe 'message' do

  describe "get POST/message/send" do
    before(:each) do
      @twilio_client = double("twilio_client")
      @messages_endpoint = double("messages_endpoint", :create => Object.new)
      @twilio_client.stub_chain(:account, :sms, :messages).and_return(@messages_endpoint)
      Twilio::REST::Client.stub(:new).and_return(@twilio_client)
    end

    it "returns 200 with valid parameters" do
      get 'POST/message/send?to=012-345-6789&type=1'
      response.status.should == 200
    end

    it "returns 500 without a message type" do
      get 'POST/message/send?to=012-345-6789'
      response.status.should == 500
    end

    it "wraps the response in a jsonp callback when a callback is specified" do
      get 'POST/message/send?callback=callback'
      response.body.should start_with "callback("
    end
  end

end