ShelbyGtWeb::Application.routes.draw do

  # SEO PAGES
  get '/video/:provider_name/:provider_id(/*title)' => 'seovideo#show'


  # HOME
  get '/team' => 'home#team'
  get '/hash_app' => 'home#hash_app'
  get '/community(/:entry_id)' => "home#community"
  get '/featured(/:entry_id)' => "home#featured"
  get '/channels(*path)' => "home#channels"
  get '/search' => "home#search"
  get '/learn_more' => "home#learn_more"

  # used by vanity (A/B testing) to register partcipants via javascript
  match '/vanity/add_participant' => 'vanity#add_participant', :as => :add_participant

  # allow access to the vanity dashboard in development for manually selecting test alternatives
  match '/vanity(/:action(/:id(.:format)))', :controller=>:vanity if Rails.env.development?

  get '(*path)' => 'home#index', :as => :root, :constraints => { :path => /[^\/]+/ }
  # otherwise catch any multi-segment path
  get '(*path)' => 'home#index', :as => :root

end
