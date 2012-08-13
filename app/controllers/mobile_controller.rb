class MobileController < ApplicationController

  def search
    # render just search box
    @query_param = params[:q]
  end

  def search_results
    # get frames from shelby genius roll
    if @frames = Shelby::API.get_frames_in_roll(params[:id])
      # great successes
    end
  end
  
end