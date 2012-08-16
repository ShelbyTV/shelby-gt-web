class MobileController < ApplicationController

  def search
    # render just search box
    @query_param = params[:q]
  end

  def roll
    # get frames from shelby genius roll
    if @roll = Shelby::API.get_frames_in_roll(params[:id])
      @frames = @roll['frames']
      @roll.delete('frames')
      # great successes
    end
  end
  
end