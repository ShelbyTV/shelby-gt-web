libs.shelbyGT.AppRouter = Backbone.Router.extend({

  routes : {
    "static/*url"   : "initStatic",
    "embedded/*url" : "initEmbedded",
    "mail/*url"     : "initDiscussionRoll",
    "mail"          : "initDiscussionRoll",
    "*url"          : "initDynamic"
  },

  //---
  //ROUTE HANDLERS
  //---

  initStatic : function(){
    //init static router
    this._reroute();
  },

  initEmbedded : function(){
    //init embed router
    this._reroute();
  },

  initDiscussionRoll : function(url){
    //if logged-in AND desktop browser: full app view.  Otherwise: discussion-only, mobile first view.
    //XXX full app view is not yet implemented (but will resuse many of the views with somewhat different styling)
    if (false && shelby.userSignedIn() && !Browser.isMobile()){
      this.initDynamic(url);
    } else {
      //otherwise, showing the discussion-specific, mobile first view
      shelby.router = new libs.shelbyGT.StandaloneDiscussionRollRouter();
      this._bootstrapRequiredAppModels();
      this._reroute();
    }
  },

  initDynamic : function(url){
    shelby.router = new libs.shelbyGT.DynamicRouter();
    shelby.models.routingState = new libs.shelbyGT.RoutingStateModel();

    this._bootstrapRequiredAppModels();

    shelby.models.guide = new libs.shelbyGT.GuideModel();
    shelby.models.playlistManager = new libs.shelbyGT.PlaylistManagerModel();
    shelby.models.guideOverlay = new libs.shelbyGT.GuideOverlayModel();
    shelby.models.dotTvWelcome = new libs.shelbyGT.DotTvWelcomeModel();
    shelby.models.dashboard = new libs.shelbyGT.DashboardModel();
    shelby.models.viewedVideos = new libs.shelbyGT.ViewedVideosModel();
    shelby.models.queuedVideos = new libs.shelbyGT.QueuedVideosModel();
    shelby.models.invite = new libs.shelbyGT.InviteModel();
    shelby.models.videoSearch = new libs.shelbyGT.VideoSearchModel();
    shelby.models.userProfile = new libs.shelbyGT.UserProfileModel();

    shelby.models.playbackState = new libs.shelbyGT.PlaybackStateModel();
    shelby.models.userDesires = new libs.shelbyGT.UserDesiresStateModel();
    shelby.models.userActivity = new libs.shelbyGT.UserActivityModel();

    shelby.models.rollFollowings = new libs.shelbyGT.RollsCollectionModel();
    shelby.models.onboardingRollCategories = new libs.shelbyGT.RollCategoriesCollectionModel({segment: 'onboarding'});
    shelby.models.promoRollCategories = new libs.shelbyGT.RollCategoriesCollectionModel({segment: 'in_line_promos'});
    shelby.models.userChannels = new libs.shelbyGT.AssociatedRollsCollectionModel();

    shelby.collections.videoSearchResultFrames = new libs.shelbyGT.FramesCollection();

    libs.utils.rhombus.login.init_login();
    libs.utils.rhombus.videos_watched.init_videos_watched();
    libs.utils.rhombus.heartbeat.init_heartbeat();
    libs.utils.rhombus.activity.init_activity();

    var self = this;

    // when the DOM is ready load the social libraries that we use for logged out users to interact with
    // twitter and facebook
    if (!shelby.config.socialLibsLoade) {
      $(document).ready(function(){
        $('body').append(SHELBYJST['social-libs']());
      });
      shelby.config.socialLibsLoaded = true;
    }

    if (shelby.userSignedIn()){
      shelby.models.user.fetch({
        success: function(userModel, response) {
          // if the user is trying to view an isolated roll, don't show onboarding right now.
          if (/isolated-roll/.test(url)){
            self._reroute();
          }
          else if (url.indexOf('onboarding') == -1) {
            var userOnboardingProgress = userModel.get('app_progress').get('onboarding');
            if (!userOnboardingProgress) {
              self.navigate('/onboarding/1', {trigger:true, replace:true});
              return;
            } else {
              if (userOnboardingProgress < 4) {
                  self.navigate('/onboarding/' + (userOnboardingProgress + 1), {trigger:true, replace:true});
              } else {
                  self._reroute();
              }
            }
          } else {
            self._reroute();
          }

          shelby.models.rollFollowings.fetch();
          shelby.models.promoRollCategories.fetch();
          shelby.checkFbTokenValidity();
          shelby.track('identify', {nickname: userModel.get('nickname')});
          libs.utils.flash.detectFlash();
          libs.utils.intercom.boot(userModel);
          if (shelby.models.guide.get('displayState') != libs.shelbyGT.DisplayState.dotTv) {
            libs.utils.userNotifications.init(userModel);
          }
        }
      });
    }
    else {
      //setup for a user who is not signed in
      shelby.models.user = new libs.shelbyGT.AnonUserModel();

      $(document).ready(function(){
        $('body').toggleClass('shelby--user-anonymous', true);
      });

      shelby.views.emailCollection = shelby.views.emailCollection ||
        new libs.shelbyGT.emailCollection({
          el : '.js-email-collection'
      });

      this._reroute();
      shelby.track('identify', {nickname: 'anonymous'});
      shelby.models.promoRollCategories.fetch();
      libs.utils.flash.detectFlash();
    }
  },

  //---
  //PRIVATE METHODS
  //---

  _reroute : function(url, prefix){
    Backbone.history.stop();
    Backbone.history.start({pushState:true});
  },

  // models common to Dynamic and DiscussionRoll
  _bootstrapRequiredAppModels : function() {
    shelby.models.user = new libs.shelbyGT.UserModel();
    shelby.models.notificationState = new libs.shelbyGT.notificationStateModel();
  }

});
