class MobileController < ApplicationController

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