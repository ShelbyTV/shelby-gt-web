DynamicRouter = Backbone.Router.extend({
  routes : {
    "rolls/:id" : "displayRoll",
    "/" : "displayDashboard",
    "*url" : "doNothing"
  },

  doNothing : function(){
    console.log('bad url');
  },

  displayRoll : function(id){
    console.log('displaying roll', shelby.models.guide);
    shelby.views.guide = new GuideView({model:shelby.models.guide});
    $(document.body).html(shelby.views.guide.el);
    var roll = new RollModel({id:id});
    shelby.models.guide.set('displayedRoll', roll);
  },

  displayDashboard : function(){
  }
  
});
