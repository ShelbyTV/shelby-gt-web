require 'twilio-ruby'

class MessageController < ApplicationController
  def send_message
    to = params.delete(:to)
    if to
      if to[0] == '1'
        to = "+" + to
      elsif to[0] != '+'
        to = "+1" + to
      end
    end
    @to = to

    @message_type = params.delete(:type).to_i

    twilio_client = Twilio::REST::Client.new(Settings::Twilio.account_sid, Settings::Twilio.auth_token)

    if @message_type == 1
      @status = 200
      begin
        twilio_client.account.sms.messages.create({
          :from => Settings::Twilio.from_number,
          :to => @to,
          :body => Settings::Twilio.appstore_install_message
        })
      rescue
        @status = 500
      end
      @result = { :status => @status }
    else
      @status = 500
      @result = { :status => @status, :message => "You must specify a valid message type"}
    end
    render json: @result, status: @status, :callback => params[:callback]
  end
end
