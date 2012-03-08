$(document).ready(function(){
  window.shelby = {
    models : {},
    views : {},
    router : new AppRouter()
  };
  Backbone.history.start({pushState:true});
});
