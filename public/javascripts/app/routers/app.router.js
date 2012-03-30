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
    var self = this;
    shelby.models.user.bind('error', function(){console.log('error'); });
    if (shelby.userSignedIn()){
      shelby.models.user.fetch({
        global: false,
        data: {
          include_rolls: true
        },
        success:function() {
          self._reroute();
        }
      });
    }
    else{
      // no authenticated user, begin the logged-out user experience
      // TODO: configure the logged out experience
      console.log('You are not a logged in user, I should be configuring the logged out experience.');
      // TEMPORARY SOLUTION:
      $('#temp-signin').show();
    }
  },

  //---
  //PRIVATE METHODS
  //---

  _reroute : function(url, prefix){
    Backbone.history.stop();
    Backbone.history.start({pushState:true});
  }
});
