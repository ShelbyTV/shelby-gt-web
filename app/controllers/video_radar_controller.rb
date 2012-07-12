class VideoRadarController < ApplicationController

  def boot
    params[:chrome_extension] ? @use_case = "extension" : @use_case = "bookmarklet"
  end

  def load
    @prefix = ""
    params[:chrome_extension] ? @use_case = "extension": @use_case = "bookmarklet"
  end
end
