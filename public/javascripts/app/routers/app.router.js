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
    shelby.models.fetchState = new libs.shelbyGT.FetchStateModel();

    shelby.models.playbackState = new libs.shelbyGT.PlaybackStateModel();
    shelby.models.userDesires = new libs.shelbyGT.UserDesiresStateModel();
		
		shelby.models.notificationState = new libs.shelbyGT.notificationStateModel();
		
    shelby.models.rollFollowings = new libs.shelbyGT.RollsCollectionModel();
    shelby.models.browseRolls = new libs.shelbyGT.RollsCollectionModel();

    var self = this;

    shelby.models.user.fetch({
      global: false,
      success: function() {
        shelby.models.rollFollowings.fetch({
          success : function() {
            self._reroute();
          }
        });
      },
      error: function(){
        self.initAnonymous(url);
      }
    });
  },

  initAnonymous : function(url){
    // init anon user -> nav to featured roll or url specified roll
    shelby.models.user = new libs.shelbyGT.AnonUserModel();
    this.navigate(url ? '/'+url : '/roll/'+_(shelby.models.user.getRollFollowings()).first().id, {trigger:false});
    this._reroute();
  },

  //---
  //PRIVATE METHODS
  //---

  _reroute : function(url, prefix){
    Backbone.history.stop();
    Backbone.history.start({pushState:true});
  }
});
