module MobileHelper

  def can_play_video(provider_name)
    ["youtube","vimeo", "dailymotion"].include?(provider_name)
  end

end
