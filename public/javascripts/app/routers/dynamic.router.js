DynamicRouter = Backbone.Router.extend({

  routes : {
    "" : "displayDashboard",
    "rolls/:id" : "displayRoll",
    "*url" : "doNothing"
  },

  //---
  //ROUTE HANDLERS
  //---

  displayDashboard : function(){
    console.log('displaying dashboard');
    this._setupGuideView();
    shelby.models.dashboard = new DashboardModel();
    shelby.models.guide.set({'childPane': DashboardView, 'displayedItem': shelby.models.dashboard});
  },

  displayRoll : function(id){
    console.log('displaying roll');
    this._setupGuideView();
    var roll = new RollModel({id:id});
    shelby.models.guide.set({'childPane': RollView, 'displayedItem': roll});
  },

  doNothing : function(){
    console.log('bad url');
  },

  //---
  //PRIVATE METHODS
  //---

  _setupGuideView : function(){
    shelby.views.guide = shelby.views.guide || new GuideView({model:shelby.models.guide});
    $(document.body).html(shelby.views.guide.el);
  }
  
});
