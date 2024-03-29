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
    if (false && shelby.userIsCommonCookieAuthed() && !Browser.isMobile()){
      this.initDynamic(url);
    } else {
      //otherwise, showing the discussion-specific, mobile first view
      shelby.router = new libs.shelbyGT.StandaloneDiscussionRollRouter();
      this._bootstrapRequiredAppModels();
      this._reroute();
    }
  },

  initDynamic : function(url, params){
    shelby.router = new libs.shelbyGT.DynamicRouter();
    shelby.models.routingState = new libs.shelbyGT.RoutingStateModel({params: params});

    this._bootstrapRequiredAppModels();

    shelby.models.guide = new libs.shelbyGT.GuideModel();
    shelby.models.playlistManager = new libs.shelbyGT.PlaylistManagerModel();
    shelby.models.guideOverlay = new libs.shelbyGT.GuideOverlayModel();
    // shelby.models.dotTvWelcome = new libs.shelbyGT.DotTvWelcomeModel();
    shelby.models.dashboard = new libs.shelbyGT.DashboardModel();
    shelby.models.viewedVideos = new libs.shelbyGT.ViewedVideosModel();
    shelby.models.queuedVideos = new libs.shelbyGT.QueuedVideosModel();
    shelby.models.invite = new libs.shelbyGT.InviteModel();
    shelby.models.videoSearch = new libs.shelbyGT.VideoSearchModel();
    // shelby.models.userProfile = new libs.shelbyGT.UserProfileModel();
    shelby.models.userPreferencesView = new libs.shelbyGT.UserPreferencesViewModel();

    shelby.models.playbackState = new libs.shelbyGT.PlaybackStateModel();
    shelby.models.userDesires = new libs.shelbyGT.UserDesiresStateModel();
    shelby.models.userActivity = new libs.shelbyGT.UserActivityModel();

    shelby.models.rollFollowings = new libs.shelbyGT.RollsCollectionModel();
    shelby.models.rollFollowingsIncludingFauxUsers = new libs.shelbyGT.RollsCollectionModel();
    shelby.models.rollCategories = new libs.shelbyGT.RollCategoriesCollectionModel({segment: 'onboarding'});
    shelby.models.serviceConnectingAnimationView = new libs.shelbyGT.ServiceConnectingAnimationViewModel();
    shelby.models.promoRollCategories = new libs.shelbyGT.RollCategoriesCollectionModel({segment: 'in_line_promos'});
    shelby.models.userOwnedRolls = new libs.shelbyGT.AssociatedRollsCollectionModel();

    shelby.collections.videoSearchResultFrames = new libs.shelbyGT.FramesCollection();
    shelby.collections.dynamicRecommendations = new libs.shelbyGT.DynamicRecommendationsCollection();
    shelby.collections.dashboardFrameGroupsCollection = null;

    libs.utils.rhombus.login.init_login();
    libs.utils.rhombus.videos_watched.init_videos_watched();
    libs.utils.rhombus.heartbeat.init_heartbeat();
    libs.utils.rhombus.activity.init_activity();

    var self = this;

    // when the DOM is ready load the social libraries that we use for logged out users to interact with
    // twitter and facebook
    if (!shelby.config.socialLibsLoaded) {
      $(document).ready(function(){
        $('body').append(SHELBYJST['social-libs']());
      });
      shelby.config.socialLibsLoaded = true;
    }

    if (shelby.userIsCommonCookieAuthed()){
      shelby.models.user.fetch({
        success: function(userModel, response) {
          self._reroute();

          shelby.models.rollFollowings.fetch();
          shelby.models.promoRollCategories.fetch();
          shelby.promises.dynamicRecommendationsFetch = $.when(shelby.collections.dynamicRecommendations.fetch({
            data: {
              limits: shelby.config.recommendations.limits.firstPage,
              min_score: shelby.config.recommendations.videoGraph.minScore,
              scan_limit: shelby.config.recommendations.videoGraph.dashboardScanLimit,
              sources: shelby.config.recommendations.sources.firstPage
            }
          }));
          shelby.checkFbTokenValidity();
          shelby.track('identify', {nickname: userModel.get('nickname')});

          userModel.trackSessionCount();

          libs.utils.flash.detectFlash();
          libs.utils.intercom.send('boot', userModel);
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
          el : '.js-email-collection',
          guide: shelby.models.guide
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
