ShelbyGtWeb::Application.routes.draw do

  # Genius is broken and shouldn't be publicly available.
  # get '/genius' => 'genius#index'
  constraints(:subdomain => 'm') do
  end

  #######################XXX###############################
  # For development, take me out when mobile is more stable
  if Rails.env.development?
    get '/m' => 'mobile#landing', :as => :mobile_landing
    get '/m/stream' => 'mobile#stream', :as => :mobile_stream
    get '/m/featured' => 'mobile#featured', :as => :mobile_featured
    get '/m/me(*path)' => 'mobile#me', :as => :mobile_me
    get '/m/signout' => 'mobile#signout', :as => :mobile_signout
    get '/m/onboarding/(*path)' => 'mobile#onboarding', :as => :mobile_onboarding
    # for user shares
    get '/m/(*path)' => 'mobile#roll', :as => :mobile_shares
    constraints(:subdomain => 'm.localhost') do
      #get '/' => 'mobile#landing', :as => :mobile_landing
      #get '/stream' => 'mobile#stream', :as => :mobile_stream
      #get '/featured' => 'mobile#featured', :as => :mobile_featured
      #get '/me(*path)' => 'mobile#me', :as => :mobile_me
    end
  end
  #######################XXX###############################

  # SEO PAGES
  get '/video/:provider_name/:provider_id(/*title)' => 'seovideo#show'

  # FRAMES
  get '/frame/:frame_id' => 'frame#just_frame'
  get '/roll/:roll_id/frame/:frame_id' => 'frame#show'
  get '/roll/:roll_id/frame/:frame_id/:frame_action' => 'frame#show'
  get '/isolated-roll/:roll_id/frame/:frame_id' => 'frame#show_frame_in_isolated_roll'

  # ROLLS
  get '/roll/:roll_id/:title' => 'roll#show'
  get '/roll/:roll_id' => 'roll#show'
  get '/user/:user_id_or_nickname/personal_roll' => 'roll#show_personal_roll', :constraints => { :user_id_or_nickname => /[^\/]+/ }
  get '/isolated-roll/:roll_id' => 'roll#show_isolated_roll'
  get '/subscribe-via-email/roll/:roll_id' => 'roll#subscribe_via_email'

  # DISCUSSION ROLLS
  get '/mail/:roll_id' => 'discussion_roll#show'

  # INVITES
  get '/invite/:invite_id' => "signup#show"
  get "invite" => 'signup#show', :as => :invite
  post "invite" => 'signup#create'
  get "signup" => 'signup#show', :as => :signup
  get "signup/:code" => 'signup#show'
  post "signup" => 'signup#create'


  # HOME
  get '/team' => 'home#team'
  get '/hash_app' => 'home#hash_app'
  get '/community(/:entry_id)' => "home#community"
  get '/featured(/:entry_id)' => "home#featured"
  get '/channels(*path)' => "home#channels"
  get '/search' => "home#search"
  get '/learn_more' => "home#learn_more"

  get '/experience' => "home#experience"

  get '/signout' => "home#signout", :as => :signout

  #STATS
  get '/user/:user_id/stats' => "home#stats"

  #SHARES
  get '/:user_id_or_nickname/shares(/:frame_id)' => "home#shares", :constraints => { :user_id_or_nickname => /[^\/]+/ }

  # TURBO EMBED
  get '/turbo_embellish' => 'turbo_embed#embellish'
  get '/embed/:frame_id' => 'turbo_embed#embed'

  # used by vanity (A/B testing) to register partcipants via javascript
  match '/vanity/add_participant' => 'vanity#add_participant', :as => :add_participant

  # allow access to the vanity dashboard in development for manually selecting test alternatives
  match '/vanity(/:action(/:id(.:format)))', :controller=>:vanity if Rails.env.development?

  # Everything else falls through to home#index
  # This used to handle *everything* but now it's much more limited in scope
  # XXX Still handles non-shelby-domain iso rolls :(
  post '(*path)' => 'home#index', :as => :root
  # first allow single segment paths that contain any character besides /, so we can handle things like /user.name
  get '(*path)' => 'home#index', :as => :root, :constraints => { :path => /[^\/]+/ }
  # otherwise catch any multi-segment path
  get '(*path)' => 'home#index', :as => :root

end
