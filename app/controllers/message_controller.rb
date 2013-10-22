require 'twilio-ruby'

class MessageController < ApplicationController
  def send_message
    @status = 200

    to = params.delete(:to)
    @to = to

    @message_type = params.delete(:type).to_i

    twilio_client = Twilio::REST::Client.new(Settings::Twilio.account_sid, Settings::Twilio.auth_token)

    if @message_type == 1
      begin
        twilio_client.account.sms.messages.create({
          :from => Settings::Twilio.from_number,
          :to => @to,
          :body => "Install the Shelby.tv app"
        })
      rescue
        @status = 500
      end

      @result = { :status => @status }
      render json: @result, status: @status
    else
      @status = 500
      @result = { :status => @status, :message => "You must specify a valid message type"}
      render json: @result, status: @status
    end
  end
end
