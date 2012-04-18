#
# Using a simple gem to provide settings in the format Settings.Namespace.setting_name.
# The settings values themseleves are enumerated in the yml files (below)
#
# N.B. Do not use nesting within the yaml itself!  Current versions of parsers don't handle nesting
#      along with default blocks.
#
module Settings

  class ShelbyAPI < Settingslogic
    source "#{Rails.root}/config/settings/shelby_api.yml"
    namespace Rails.env
    load!
  end

  class Facebook < Settingslogic
    source "#{Rails.root}/config/settings/facebook.yml"
    namespace Rails.env
    load!
  end

  class Application < Settingslogic
    source "#{Rails.root}/config/settings/application.yml"
    namespace Rails.env
    load!
  end

end