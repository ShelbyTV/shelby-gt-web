module MobileHelper

  def can_play_video(provider_name)
    Settings::Mobile.supported_providers.include?(provider_name)
  end

end
