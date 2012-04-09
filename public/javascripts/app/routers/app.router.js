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
    shelby.models.share = new libs.shelbyGT.ShareModel();
    shelby.models.playbackState = new libs.shelbyGT.PlaybackStateModel();
    shelby.models.userDesires = new libs.shelbyGT.UserDesiresStateModel();
    var self = this;
      shelby.models.user.fetch({
        global: false,
        data: {
          include_rolls: true
        },
        success: function() {
          self._reroute();
        },
        error: function(){
          self.initAnonymous();
        }
      });
  },

  initAnonymous : function(){
    console.log('initting anon user');
    shelby.models.user = new libs.shelbyGT.AnonUserModel();
    //set url to first anon roll and reroute
    var firstRollId = shelby.models.user.get('roll_followings').first().id;
    this.navigate('/roll/'+firstRollId, {trigger:false});
    console.log('about to reroute', firstRollId);
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
