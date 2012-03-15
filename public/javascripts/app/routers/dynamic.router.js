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
    //this._setupRollView(rollId, {activeFrameId:frameId});
    //var frame = new FrameModel({id:frameId});
    //this._setupRollView(rollId, {activeFrame:frame});
  },

  displayRoll : function(id){
    this._bindContentPaneModelChanges()
    this._setupRollView(id);
  },

  displayDashboard : function(){
    this._bindContentPaneModelChanges()
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

  _bindContentPaneModelChanges : function(){
    shelby.models.guide.bind('change:contentPaneModel', function(guideModel, contentPaneModel){
      console.log('change fired', contentPaneModel);
      contentPaneModel.bind('sync', function(){
        console.log('FRAMES', contentPaneModel);
      });
      contentPaneModel.fetch();
    });
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
