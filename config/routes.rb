ShelbyGtWeb::Application.routes.draw do

  get '/genius' => 'genius#index'
  get '/fb/genius' => 'facebook_genius#index'
  post '/fb/genius' => 'facebook_genius#index'
  
  constraints(:subdomain => 'm') do
    get '/' => 'mobile#search', :as => :mobile_search
    get '/roll/:id' => 'mobile#roll', :as => :mobile_roll
  end
  
  #######################XXX###############################
  # For development, take me out when mobile is more stable
  get '/m' => 'mobile#search', :as => :mobile_search
  get '/m/roll/:id' => 'mobile#roll', :as => :mobile_roll
  constraints(:subdomain => 'm.localhost') do
    get '/' => 'mobile#search', :as => :mobile_search # to show mobile search as shelby.tv ?
    get '/roll/:id' => 'mobile#roll', :as => :mobile_roll
  end
  #######################XXX###############################
  
  # SEO PAGES
  get '/video/:provider_name/:provider_id(/*title)' => 'seovideo#show'
  
  # FRAMES
  get '/frame/:frame_id' => 'frame#just_frame'
  get '/roll/:roll_id/frame/:frame_id' => 'frame#show'
  get '/isolated-roll/:roll_id/frame/:frame_id' => 'frame#show_frame_in_isolated_roll'
  get '/fb/genius/roll/:roll_id/frame/:frame_id' => 'frame#show_fb_genius_frame', :as => :fb_genius_frame
  
  # ROLLS
  get '/roll/:roll_id/:title' => 'roll#show'
  get '/roll/:roll_id' => 'roll#show'
  get '/user/:user_id/personal_roll' => 'roll#show_personal_roll'
  get '/fb/genius/roll/:roll_id' => 'roll#show_fb_genius_roll', :as => :fb_genius_roll
  get '/isolated-roll/:roll_id' => 'roll#show_isolated_roll'
  
  # DISCUSSION ROLLS
  get '/chat/:roll_id' => 'discussion_roll#show'

  # INVITES
  get '/invite/:invite_id' => "home#invite"

  # HOME
  get '/explore' => "home#explore"
  get '/search' => "home#search"
  get '/channel/:channel' => "home#channel"
  get '/signout' => "home#signout", :as => :signout

  # used by vanity (A/B testing) to register partcipants via javascript
  match '/vanity/add_participant' => 'vanity#add_participant', :as => :add_participant

  # allow access to the vanity dashboard in development for manually selecting test alternatives
  match '/vanity(/:action(/:id(.:format)))', :controller=>:vanity if Rails.env.development?

  # Everything else falls through to home#index
  # This used to handle *everything* but now it's much more limited in scope
  # XXX Still handles non-shelby-domain iso rolls :(
  post '(*path)' => 'home#index', :as => :root
  get '(*path)' => 'home#index', :as => :root
  
end
