class FrameController < ApplicationController
  
  # redirects to roll/:roll_id/frame/:frame_id which is handled by web app
  def show
    frame = Shelby::API.get_frame_info(params[:frame_id])
    puts "got frame #{frame}"
    if frame and frame["roll_id"]
      redirect_to "/roll/#{frame["roll_id"]}/frame/#{frame["id"]}"
    else
      redirect_to root_path
    end
  end
  
end