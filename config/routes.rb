ShelbyGtWeb::Application.routes.draw do

  get '/genius' => 'genius#index'
  get '/m(/*query)' => 'genius#mobile_search'
  post '/m/results' => 'genius#mobile_results'

  get '/video/:provider_name/:provider_id(/*title)' => "seovideo#show"
  
  # redirects to roll/:roll_id/frame/:frame_id which is handled by web app
  get '/frame/:frame_id' => "frame#show"

  get '/signout' => "home#signout", :as => :signout

  get '/video_radar/load.js' => 'video_radar#load', :format => "js"

  get '(*path)' => 'home#index', :as => :root

  # The priority is based upon order of creation:
  # first created -> highest priority.

  #root :to => 'home#login'
  
end
