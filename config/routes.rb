ShelbyGtWeb::Application.routes.draw do
  match "/#{Jammit.package_path}/:package.:extension",
    :to => 'jammit#package', :as => :jammit, :constraints => {
      # A hack to allow extension to include "."
      :extension => /.+/
    }
  match '(*path)' => 'home#index'
end
