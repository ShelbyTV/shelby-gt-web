DynamicRouter = Backbone.Router.extend({

  routes : {
    "" : "displayDashboard",
    "rolls/:id" : "displayRoll",
    "*url" : "doNothing"
  },

  //---
  //ROUTE HANDLERS
  //---

  displayRoll : function(id){
    console.log('displaying roll', shelby.models.guide);
    this._setupGuideView();
    var roll = new RollModel({id:id});
    shelby.models.guide.set('displayedRoll', roll);
  },

  displayDashboard : function(){
    console.log('displaying dashboard');
    shelby.models.dashboard = new DashboardModel();
  },

  doNothing : function(){
    console.log('bad url');
  },

  //---
  //PRIVATE METHODS
  //---

  _setupGuideView : function(){
    shelby.views.guide = new GuideView({model:shelby.models.guide});
    $(document.body).html(shelby.views.guide.el);
  }
  
});
