#
# Using a simple gem to provide settings in the format Settings.Namespace.setting_name.
# The settings values themseleves are enumerated in the yml files (below)
#
# N.B. Do not use nesting within the yaml itself!  Current versions of parsers don't handle nesting
#      along with default blocks.
#
module Settings
  
  Dir.glob("#{Rails.root}/config/settings/*.yml").each do |filename|
    klass = Class.new(Settingslogic) do
      source filename
      namespace Rails.env
      load!
    end
    Settings.const_set File.basename(filename, ".yml").camelcase, klass
  end

  # The above is equivalent to writing the following for every yml file in the settings directory:
  #
  #class Global < Settingslogic
  #  source "#{Rails.root}/config/settings/global.yml"
  #  namespace Rails.env
  #  load!
  #end

end