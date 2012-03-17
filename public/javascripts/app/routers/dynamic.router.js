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
    this._bindContentPaneModelChanges(this._activateFirstRollFrame);
    this._setupRollView(id);
  },

  displayDashboard : function(){
    this._bindContentPaneModelChanges(this._activateFirstDashboardFrame);
    this._setupTopLevelViews();
    shelby.models.dashboard = new DashboardModel();
    shelby.models.guide.set({'contentPaneView': DashboardView, 'contentPaneModel': shelby.models.dashboard});
  },

  doNothing : function(){
    console.log('bad url');
  },

  //---
  //PRIVATE METHODS
  //---

  _bindContentPaneModelChanges : function(cb){
    shelby.models.guide.unbind('change:contentPaneModel');
    shelby.models.guide.bind('change:contentPaneModel', function(guideModel, contentPaneModel){
      contentPaneModel.fetch({success:cb});
    });
  },

  _activateFirstRollFrame : function(contentPaneModel, response) {
	  var firstFrame = contentPaneModel.get('frames').first();
	  shelby.models.guide.set('activeFrameModel', firstFrame);
  },

  _activateFirstDashboardFrame : function(contentPaneModel, response) {
	  var firstFrame = contentPaneModel.get('dashboard_entries').first().get('frame');
	  shelby.models.guide.set('activeFrameModel', firstFrame);
  },

  _setupTopLevelViews : function(){
    shelby.views.guide = shelby.views.guide || new GuideView({model:shelby.models.guide});
    shelby.views.video = shelby.views.video || new libs.shelbyGT.VideoDisplayView({model:shelby.models.guide});
  },
  
  _setupRollView : function(rollId, guideAttrs){
    this._setupTopLevelViews();
    var roll = new RollModel({id:rollId});
    shelby.models.guide.set(_.extend({'contentPaneView': RollView, 'contentPaneModel': roll}, guideAttrs)); //fetch will be called on roll
  }

});
