DynamicRouter = Backbone.Router.extend({

  routes : {
    "rolls/:rollId/frame/:frameId" : "displayFrameInRoll",
    "rolls/:id" : "displayRoll",
    "" : "displayDashboard",
    "*url" : "doNothing"
  },

  //---
  //ROUTE HANDLERS
  //---

  displayFrameInRoll : function(rollId, frameId){
    this._setupRollView(rollId, {activeFrameId:frameId});
  },

  displayRoll : function(id){
    this._setupRollView(id);
  },

  displayDashboard : function(){
    this._setupGuideView();
    shelby.models.dashboard = new DashboardModel();
    shelby.models.guide.set({'contentPaneView': DashboardView, 'contentPaneModel': shelby.models.dashboard});
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
  },
  
  _setupRollView : function(rollId, guideAttrs){
    this._setupGuideView();
    var roll = new RollModel({id:rollId});
    shelby.models.guide.set(_.extend({'contentPaneView': RollView, 'contentPaneModel': roll}, guideAttrs));
  }

});
