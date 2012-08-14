libs.shelbyGT.AppRouter = Backbone.Router.extend({

  routes : {
    "static/*url" : "initStatic",
    "embedded/*url" : "initEmbedded",
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

  initDynamic : function(url){
    shelby.router = new libs.shelbyGT.DynamicRouter();
    shelby.models.user = new libs.shelbyGT.UserModel();
    shelby.models.guide = new libs.shelbyGT.GuideModel();
    shelby.models.guideOverlay = new libs.shelbyGT.GuideOverlayModel();
    shelby.models.dashboard = new libs.shelbyGT.DashboardModel();
    shelby.models.viewedVideos = new libs.shelbyGT.ViewedVideosModel();
    shelby.models.queuedVideos = new libs.shelbyGT.QueuedVideosModel();

    shelby.models.playbackState = new libs.shelbyGT.PlaybackStateModel();
    shelby.models.userDesires = new libs.shelbyGT.UserDesiresStateModel();
		
		shelby.models.notificationState = new libs.shelbyGT.notificationStateModel();
		
    shelby.models.rollFollowings = new libs.shelbyGT.RollsCollectionModel();
    shelby.models.exploreRollCategories = new libs.shelbyGT.RollCategoriesCollectionModel();

    libs.utils.rhombus.login.init_login();
    libs.utils.rhombus.videos_watched.init_videos_watched();
    libs.utils.rhombus.heartbeat.init_heartbeat();
    libs.utils.rhombus.activity.init_activity();

    var self = this;
    
    
    if (shelby.userSignedIn()){
      shelby.models.user.fetch({
        success: function() {
          self._reroute();
          shelby.models.rollFollowings.fetch();
          shelby.checkFbTokenValidity();
          shelby.track('identify', {nickname: shelby.models.user.get('nickname')});
        }
      });
    }
    else {
      self.initAnonymous(url);
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
  }

});
