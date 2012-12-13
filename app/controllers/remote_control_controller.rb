class RemoteControlController < ApplicationController
  layout 'remote_control'  
  ##
  # GET /r/:id
  #
  # Show a remote to control the app on another screen
  #
  def show
    @channel = params[:id]
    @url = "#{Settings::ShelbyAPI.url}#{Settings::ShelbyAPI.version}/remote_control/#{params[:id]}"
  end

end