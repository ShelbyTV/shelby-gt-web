ShelbyGtWeb::Application.routes.draw do
  match "/#{Jammit.package_path}/:package.:extension",
    :to => 'jammit#package', :as => :jammit, :constraints => {
      # A hack to allow extension to include "."
      :extension => /.+/
    }
  match '(*path)' => 'home#index'

  # The priority is based upon order of creation:
  # first created -> highest priority.


  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'
end
