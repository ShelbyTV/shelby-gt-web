DynamicRouter = Backbone.Router.extend({

  routes : {
    "roll/:rollId/frame/:frameId" : "displayFrameInRoll",
    "roll/:rollId" : "displayRoll",
    "" : "displayDashboard",
    "*url" : "doNothing"
  },

  //---
  //ROUTE HANDLERS
  //---

  displayFrameInRoll : function(rollId, frameId){
    var self = this;
    this._bindContentPaneModelChanges(function(rollModel, response){
      self._activateFrameInRollById(rollModel, frameId);
    });
    this._setupRollView(rollId);
  },

  displayRoll : function(rollId){
    this._bindContentPaneModelChanges(this._activateFirstRollFrame);
    this._setupRollView(rollId);
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
      // whenever a new model (roll or dashboard) is set on the content pane, fetch (possibly re-loading) its contents
      // this way, the content pane will render with the latest contents of that roll or dashboard
      contentPaneModel.fetch({data:{include_children:true},success:cb});
    });
  },

  _activateFirstRollFrame : function(rollModel, response) {
    var firstFrame = rollModel.get('frames').first();
    window.shelby.models.guide.set('activeFrameModel', firstFrame);
  },

  _activateFrameInRollById : function(rollModel, frameId) {
    var frame;
    if (frame = rollModel.get('frames').get(frameId)) {
      window.shelby.models.guide.set('activeFrameModel', frame);
    } else {
      // url frame id doesn't exist in this roll - notify user, then redirect to the default view of the roll
      window.alert("Sorry, the video you were looking for doesn't exist.")
      shelby.router.navigate('/roll/'+rollModel.id, {trigger:true, replace:true});
    }
  },

  _activateFirstDashboardFrame : function(dashboardModel, response) {
    var firstDashboardEntry;
    if (firstDashboardEntry = dashboardModel.get('dashboard_entries').first()) {
      window.shelby.models.guide.set('activeFrameModel', firstDashboardEntry.get('frame'));
    }
  },

  _setupTopLevelViews : function(){
    window.shelby.views.guide = window.shelby.views.guide || new GuideView({model:window.shelby.models.guide});
    window.shelby.views.video = window.shelby.views.video || new libs.shelbyGT.VideoDisplayView({model:window.shelby.models.guide});
  },
  
  _setupRollView : function(rollId){
    this._setupTopLevelViews();
    var roll = new RollModel({id:rollId});
    window.shelby.models.guide.set({'contentPaneView': RollView, 'contentPaneModel': roll});
  }

});
