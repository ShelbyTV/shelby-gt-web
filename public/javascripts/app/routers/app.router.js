AppRouter = Backbone.Router.extend({

  routes : {
    "static/*url" : "initStatic",
    "embedded/*url" : "initEmbedded",
    "*url" : "initDynamic"
  },

  //---
  //ROUTE HANDLERS
  //---

  initStatic : function(){
    console.log('static');
    this._navigate('static', url);
  },

  initEmbedded : function(){
    this._navigate('embedded', url);
  },

  initDynamic : function(url){
    console.log('init dynamic', url);
    shelby.router = new DynamicRouter();
    shelby.models.guide = new GuideModel();
    Backbone.history.stop();
    Backbone.history.start({pushState:true});
  },

  //---
  //PRIVATE METHODS
  //---

  _navigate : function(url, prefix){
    prefix = prefix ? prefix+'/' : '';
    console.log(prefix+url);
    shelby.router.navigate(prefix+url, {trigger:true, replace:true}); //don't update history
  },
});
