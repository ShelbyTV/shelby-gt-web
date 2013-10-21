require 'twilio-ruby'

class MessageController < ApplicationController
  def send_message
    @status = 200

    to = params.delete(:to)
    @to = to

    twilio_client = Twilio::REST::Client.new(Settings::Twilio.twilio_account_sid, Settings::Twilio.twilio_auth_token)

    begin
      twilio_client.account.sms.messages.create({
        :from => Settings::Twilio.twilio_outgoing_number,
        :to => @to,
        :body => "Install the Shelby.tv app"
      })
    rescue
      @status = 500
    end

    @result = { :status => @status }
    render json: @result, status: @status
  end
end
