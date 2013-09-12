class MobileController < ApplicationController

  def landing

  end

  def stream
    if @current_user = Shelby::API.get_current_user and @dashboard = Shelby::API.get_user_dasboard()

      # show stream to logged in user
    else
      redirect_to '/'
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
