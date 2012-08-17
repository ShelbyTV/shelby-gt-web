ShelbyGtWeb::Application.routes.draw do

  get '/genius' => 'genius#index'

  constraints(:subdomain => 'm') do
    get '/' => 'mobile#search', :as => :mobile_search
    get '/roll/:id' => 'mobile#roll', :as => :mobile_roll
  end
  
  # For development, take me out when mobile is more stable
  get '/m' => 'mobile#search', :as => :mobile_search
  get '/m/roll/:id' => 'mobile#roll', :as => :mobile_roll

  constraints(:subdomain => 'm.localhost') do
    get '/' => 'mobile#search', :as => :mobile_search
    get '/roll/:id' => 'mobile#roll', :as => :mobile_roll
  end

  get '/video/:provider_name/:provider_id(/*title)' => "seovideo#show"
  
  # redirects to roll/:roll_id/frame/:frame_id which is handled by web app
  get '/frame/:frame_id' => "frame#show"

  get '/signout' => "home#signout", :as => :signout

  get '(*path)' => 'home#index', :as => :root

  # The priority is based upon order of creation:
  # first created -> highest priority.

  #root :to => 'home#login'
  
end
