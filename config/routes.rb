ShelbyGtWeb::Application.routes.draw do
  match "/#{Jammit.package_path}/:package.:extension",
    :to => 'jammit#package', :as => :jammit, :constraints => {
      # A hack to allow extension to include "."
      :extension => /.+/
    }

  get '/signout' => "home#signout", :as => :destroy_session

  get '(*path)' => 'home#index', :as => :root

  # The priority is based upon order of creation:
  # first created -> highest priority.

  #root :to => 'home#login'
  
end
