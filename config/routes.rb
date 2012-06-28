ShelbyGtWeb::Application.routes.draw do
  match "/#{Jammit.package_path}/:package.:extension",
    :to => 'jammit#package', :as => :jammit, :constraints => {
      # A hack to allow extension to include "."
      :extension => /.+/
    }

  get '/genius' => 'genius#index'

  get '/video/:provider_name/:provider_id(/*title)' => "seovideo#show"
  
  # redirects to roll/:roll_id/frame/:frame_id which is handled by web app
  get '/frame/:frame_id' => "frame#show"

  get '/signout' => "home#signout", :as => :signout

  get '(*path)' => 'home#index', :as => :root

  # The priority is based upon order of creation:
  # first created -> highest priority.

  #root :to => 'home#login'
  
end
