ShelbyGtWeb::Application.routes.draw do

  get "POST/message/send" => "message#send_message"

  # Genius is broken and shouldn't be publicly available.
  # get '/genius' => 'genius#index'
  constraints(:subdomain => 'm') do
    get '/' => 'mobile#landing', :as => :mobile_landing
    post '/user/create' => 'mobile#create_user'
    get '/get-started' => 'home#get_started'
    get '/log_in' => "home#log_in"
    get '/explore' => 'mobile#featured', :as => :mobile_featured
    get '/ipadbeta' => 'home#ipadbeta'
    get '/preferences' => 'mobile#preferences', :as => :mobile_preferences
    get '/preferences/:section' => 'mobile#preferences', :as => :mobile_preferences
    post '/preferences/notifications' => 'mobile#notifications', :as => :mobile_preferences
    post '/preferences/profile' => 'mobile#profile', :as => :mobile_preferences
    get '/stream' => 'mobile#stream', :as => :mobile_stream
    get '/signout' => 'mobile#signout', :as => :mobile_signout
    get '/signup' => 'signup#show', :as => :signup
    get '/signup/:code' => 'signup#show'
    get '/connecting/:service' => 'mobile#show_connecting_service'
    get '/search' => 'mobile#search'
    post '/connecting/:service' => 'mobile#set_connected_service'
    get '/:username/following' => 'mobile#following', :as => :mobile_following, :constraints => { :username => /[^\/]+/ }
    get '/:username/:type' => 'mobile#me', :as => :mobile_me, :constraints => { :username => /[^\/]+/ }
    get '/:username' => 'mobile#roll', :as => :mobile_user, :constraints => { :username => /[^\/]+/ }
  end

  scope "/amazonapp" do
    get '/' => 'mobile#landing'
    post '/user/create' => 'mobile#create_user'
    get '/get-started' => 'home#get_started'
    get '/log_in' => "home#log_in"
    get '/explore' => 'mobile#featured'
    get '/ipadbeta' => 'home#ipadbeta'
    get '/preferences' => 'mobile#preferences'
    get '/preferences/:section' => 'mobile#preferences'
    post '/preferences/notifications' => 'mobile#notifications'
    post '/preferences/profile' => 'mobile#profile'
    get '/stream' => 'mobile#stream'
    get '/signout' => 'mobile#signout'
    get '/signup' => 'signup#show', :as => :signup
    get '/signup/:code' => 'signup#show'
    get '/search' => 'mobile#search'
    get '/connecting/:service' => 'mobile#show_connecting_service'
    post '/connecting/:service' => 'mobile#set_connected_service'
    get '/:username/following' => 'mobile#following', :constraints => { :username => /[^\/]+/ }
    get '/:username/:type' => 'mobile#me', :constraints => { :username => /[^\/]+/ }
    get '/:username' => 'mobile#roll', :constraints => { :username => /[^\/]+/ }
  end

  #######################XXX###############################
  # For development, take me out when mobile is more stable
  if ["development","staging"].include?(Rails.env)
    scope "/m" do
      get '/' => 'mobile#landing', :as => :mobile_landing
      post '/user/create' => 'mobile#create_user'
      get '/get-started' => 'home#get_started'
      get '/log_in' => "home#log_in"
      get '/explore' => 'mobile#featured', :as => :mobile_featured
      get '/ipadbeta' => 'home#ipadbeta'
      get '/preferences' => 'mobile#preferences', :as => :mobile_preferences
      get '/preferences/:section' => 'mobile#preferences', :as => :mobile_preferences
      post '/preferences/notifications' => 'mobile#notifications', :as => :mobile_preferences
      post '/preferences/profile' => 'mobile#profile', :as => :mobile_preferences
      get '/stream' => 'mobile#stream', :as => :mobile_stream
      get '/signout' => 'mobile#signout', :as => :mobile_signout
      get '/signup' => 'signup#show', :as => :signup
      get '/signup/:code' => 'signup#show'
      get '/search' => 'mobile#search'
      get '/connecting/:service' => 'mobile#show_connecting_service'
      post '/connecting/:service' => 'mobile#set_connected_service'
      get '/:username/following' => 'mobile#following', :as => :mobile_following, :constraints => { :username => /[^\/]+/ }
      get '/:username/:type' => 'mobile#me', :as => :mobile_me, :constraints => { :username => /[^\/]+/ }
      get '/:username' => 'mobile#roll', :as => :mobile_user, :constraints => { :username => /[^\/]+/ }
    end
  end
  #######################XXX###############################

  post '/user/create' => 'mobile#create_user'

  # IE Surface
  get '/get-started' => 'home#get_started'

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

  # IPAD BETA PROGRAM
  get '/ipadbeta' => 'home#ipadbeta'

  # HOME
  get '/team' => 'home#team'
  get '/hash_app' => 'home#hash_app'
  get '/community(/:entry_id)' => "home#community"
  get '/explore(/:entry_id)' => "home#featured"
  get '/channels(*path)' => "home#channels"
  get '/search' => "home#search"
  get '/learn_more' => "home#learn_more"

  get '/experience' => "home#experience"

  get '/signout' => "home#signout", :as => :signout
  get '/login' => "home#login"
  get '/log_in' => "home#log_in"
  get '/user_takeout' => "home#user_takeout"
  post '/user_takeout' => "home#do_user_takeout"

  # THIS IS A TEMPORARY ROUTE to give the bookmarklet to someone (for reece)
  get '/bookmarklet' => "home#bookmarklet"
  get '/bookmarklet/radar' => 'radar#index'

  #STATS
  get '/user/:user_id/stats' => "home#stats"

  #SHARES
  get '/:user_id_or_nickname/shares(/:frame_id)' => "home#shares", :constraints => { :user_id_or_nickname => /[^\/]+/ }

  # ONE CLICK UNSUBSCRIBE
  get '/preferences/email/unsubscribe' => "home#unsubscribe"

  # UPDATE USER
  post '/preferences/profile' => 'mobile#profile'

  # TURBO EMBED
  get '/turbo_embellish' => 'turbo_embed#embellish'
  get '/embed/:frame_id' => 'turbo_embed#embed'

  # used by vanity (A/B testing) to register partcipants via javascript
  match '/vanity/add_participant' => 'vanity#add_participant', :as => :add_participant

  # allow access to the vanity dashboard in development for manually selecting test alternatives
  match '/vanity(/:action(/:id(.:format)))', :controller=>:vanity if Rails.env.development?

  #for blitz io verification
  get '/mu-4a3bea60-210d9ed2-38279c19-649e9064' => 'home#blitz'

  get '/web-app-manifest' => 'home#amazonapp', :format => true

  # Everything else falls through to home#index
  # This used to handle *everything* but now it's much more limited in scope
  # XXX Still handles non-shelby-domain iso rolls :(
  post '(*path)' => 'home#index', :as => :root
  # first allow single segment paths that contain any character besides /, so we can handle things like /user.name
  get '(*path)' => 'home#index', :as => :root, :constraints => { :path => /[^\/]+/ }
  # otherwise catch any multi-segment path
  get '(*path)' => 'home#index', :as => :root


end
