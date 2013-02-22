/* NOTE: If you want to actually start up the app, you must include app.start.js manually in your
manifest. That file is omitted here so that all of the app's functionality can be loaded for testing
without triggering default app setup actions such as routing, user fetch, etc. */
//= require ./browser
//= require ./app.config
//= require ./app.namespace
//
//shelby backbone app - assets that need to be loaded in dependency order
//= require ./models/lib/shelby.base.model.js
//= require ./config/db.config.js
//= require ./utils/backbone_collection.utils.js
//= require ./models/db/roll.model.js
//= require ./models/ui/share.model.js
//= require ./models/ui/share_action_state.model.js
//= require ./views/list_item.view.js
//= require ./views/active_highlight_list_item.view.js
//= require ./views/frame_group.view.js
//= require ./views/list.view.js
//= require ./views/smart_refresh_list.view.js
//= require ./views/paging_list.view.js
//= require ./views/inline_explore_promo.view.js
//= require ./views/inline_roll_promo.view.js
//= require ./views/inline_donate_promo.view.js
//= require ./collections/frame_groups.coll.js
//= require ./utils/playlist_type.js
//= require ./views/frame_group_play_paging_list.view.js
//= require ./views/dashboard_empty_indicator.view.js
//= require ./views/search_empty_indicator.view.js
//= require ./views/dashboard.view.js
//= require ./views/guide_overlay.view.js
//= require ./views/me_list.view.js
//= require ./views/roll_list.view.js
//= require ./views/roll.view.js
//= require ./views/video_search.view.js
//= require ./views/multiplexed_video.view.js
//= require ./views/user_preferences.view.js
//= require ./views/scrolling_guide.view.js
//= require ./views/help.view.js
//= require ./views/team.view.js
//= require ./views/legal.view.js
//= require ./views/roll_action_menu.view.js
//= require ./views/roll_header.view.js
//= require ./views/search_header.view.js
//= require ./views/iso_roll_header.view.js
//= require ./views/item_header.view.js
//= require ./views/autocomplete.view.js
//= require ./views/email_address_autocomplete.view.js
//= require ./views/shelby_autocomplete.view.js
//= require ./views/rolling_selection_item.view.js
//= require ./views/rolling_selection_list.view.js
//= require ./views/banner_notifications/generic_banner_notification.view.js
//= require ./views/share.view.js
//= require ./views/message.view.js
//= require ./views/queue_empty_indicator.view.js
//= require ./browser.js
//= require ./utils/disqus.js
//= require ./models/db/user.model.js
//
//shelby backbone app - all other assets
//= require_tree ./config
//= require_tree ./utils
//= require_tree ./models/lib
//= require_tree ./models
//= require_tree ./collections
//= require_tree ./views
//= require_tree ./routers
