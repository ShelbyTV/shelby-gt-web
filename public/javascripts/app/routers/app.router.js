/*AppRouter = Backbone.Router.extend({
  routes : {
    "/static/:url" : "initStatic",
    "embedded/*url" : "initEmbedded"
  },
  _navigate : function(url, prefix){
    prefix = prefix ? prefix+'/' : '';
    console.log(prefix+url);
    shelby.router.navigate(prefix+url, {trigger:true, replace:true}); //don't update history
  },
  initStatic : function(){
    console.log('static');
    this._navigate('static', url);
  },
  initEmbedded : function(){
    this._navigate('embedded', url);
  },
  initDynamic : function(url){
    console.log(arguments);
    console.log('init dynamic', url);
    this.routes = {};
    Backbone.history.stop();
    shelby.router = new DynamicRouter();
    Backbone.history.start();
    console.log('dynamic router initted');
    shelby.models.guide = new GuideModel();
    console.log('init dynamic done, navving');
    this._navigate(url);
  }
});*/
