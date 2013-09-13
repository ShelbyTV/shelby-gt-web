class MobileController < ApplicationController

  def landing

  end

  def stream
    if user_signed_in?
      @current_user = Shelby::API.get_user(current_user_id)
      @dashboard = Shelby::API.get_user_dasboard(current_user_id, request.headers['HTTP_COOKIE'])
    else
      redirect_to '/m'
    end
  end

  def search
    # render just search box
    @query_param = params[:q]
  end

  def roll
    # get frames from shelby genius roll
    if @roll = Shelby::API.get_roll_with_frames(params[:id])
      @frames = @roll['frames']
      @roll.delete('frames')
      # great successes
    else
      redirect_to "/"
    end
  end

end
