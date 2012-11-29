libs.shelbyGT.AppRouter = Backbone.Router.extend({

  routes : {
    "static/*url" : "initStatic",
    "embedded/*url" : "initEmbedded",
    "chat/*url" : "initDiscussionRoll",
    "*url" : "initDynamic"
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
    shelby.models.guideOverlay = new libs.shelbyGT.GuideOverlayModel();
    shelby.models.exploreGuide = new libs.shelbyGT.ExploreGuideModel();
    shelby.models.dashboard = new libs.shelbyGT.DashboardModel();
    shelby.models.viewedVideos = new libs.shelbyGT.ViewedVideosModel();
    shelby.models.queuedVideos = new libs.shelbyGT.QueuedVideosModel();
    shelby.models.invite = new libs.shelbyGT.InviteModel();

    shelby.models.playbackState = new libs.shelbyGT.PlaybackStateModel();
    shelby.models.userDesires = new libs.shelbyGT.UserDesiresStateModel();
		
    shelby.models.rollFollowings = new libs.shelbyGT.RollsCollectionModel();
    shelby.models.exploreRollCategories = new libs.shelbyGT.RollCategoriesCollectionModel({segment: 'explore'});
    shelby.models.onboardingRollCategories = new libs.shelbyGT.RollCategoriesCollectionModel({segment: 'onboarding'});
    shelby.models.promoRollCategories = new libs.shelbyGT.RollCategoriesCollectionModel({segment: 'in_line_promos'});


    libs.utils.rhombus.login.init_login();
    libs.utils.rhombus.videos_watched.init_videos_watched();
    libs.utils.rhombus.heartbeat.init_heartbeat();
    libs.utils.rhombus.activity.init_activity();

    var self = this;
    
    
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
          libs.shelbyGT.RouterUtils.fetchRollCategoriesAndCheckAutoSelect();
          shelby.models.promoRollCategories.fetch();
          shelby.checkFbTokenValidity();
          shelby.track('identify', {nickname: shelby.models.user.get('nickname')});
        }
      });
    }
    else {
      self.initAnonymous(url);
      shelby.models.promoRollCategories.fetch();
    }
  },

  initAnonymous : function(url){
    // init anon user -> nav to featured roll or url specified roll
    shelby.models.user = new libs.shelbyGT.AnonUserModel();
    this.navigate(url ? '/'+url : '/roll/'+_(shelby.models.user.getRollFollowings()).first().id, {trigger:false});
    this._reroute();
    
    shelby.track('identify', {nickname: 'anonymous'});
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
