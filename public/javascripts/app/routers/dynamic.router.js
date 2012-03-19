DynamicRouter = Backbone.Router.extend({

  routes : {
    "roll/:rollId/frame/:frameId" : "displayFrameInRoll",
    "roll/:id" : "displayRoll",
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
    this._bindContentPaneModelChanges(this._activateFirstRollFrame);
    this._setupRollView(id);
  },

  displayDashboard : function(){
    this._bindContentPaneModelChanges(this._activateFirstDashboardFrame);
    this._setupTopLevelViews();
    window.shelby.models.dashboard = new DashboardModel();
    window.shelby.models.guide.set({'contentPaneView': DashboardView, 'contentPaneModel': window.shelby.models.dashboard});
  },

  doNothing : function(){
    console.log('bad url');
  },

  //---
  //PRIVATE METHODS
  //---

  _bindContentPaneModelChanges : function(cb){
    window.shelby.models.guide.unbind('change:contentPaneModel');
    window.shelby.models.guide.bind('change:contentPaneModel', function(guideModel, contentPaneModel){
      contentPaneModel.fetch({data:{include_children:true},success:cb});
    });
  },

  _activateFirstRollFrame : function(contentPaneModel, response) {
    var firstFrame = contentPaneModel.get('frames').first();
    window.shelby.models.guide.set('activeFrameModel', firstFrame);
  },

  _activateFrameInRollById : function(rollModel, frameId) {
    // implement later to lookup a frame in a roll for the /rolls/:id/frames/:id route
  },

  _activateFirstDashboardFrame : function(contentPaneModel, response) {
    var firstDashboardEntry;
    if (firstDashboardEntry = contentPaneModel.get('dashboard_entries').first()) {
      window.shelby.models.guide.set('activeFrameModel', firstDashboardEntry.get('frame'));
    }
  },

  _setupTopLevelViews : function(){
    window.shelby.views.guide = window.shelby.views.guide || new GuideView({model:window.shelby.models.guide});
    window.shelby.views.video = window.shelby.views.video || new libs.shelbyGT.VideoDisplayView({model:window.shelby.models.guide});
  },
  
  _setupRollView : function(rollId, guideAttrs){
    this._setupTopLevelViews();
    var roll = new RollModel({id:rollId});
    window.shelby.models.guide.set(_.extend({'contentPaneView': RollView, 'contentPaneModel': roll}, guideAttrs)); //fetch will be called on roll
  }

});
