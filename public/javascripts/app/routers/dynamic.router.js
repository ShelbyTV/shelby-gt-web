libs.shelbyGT.DynamicRouter = Backbone.Router.extend({

  routes : {
    "roll/:rollId/frame/:frameId" : "displayFrameInRoll",
    "roll/:rollId/:title" : "displayRoll",
    "roll/:rollId/" : "displayRoll",
    "roll/:rollId" : "displayRoll",
    "rolls" : "displayRollList",
    "saves" : "displaySaves",
    "" : "displayDashboard",
    "*url" : "doNothing"
  },

  //---
  //ROUTE HANDLERS
  //---

  displayFrameInRoll : function(rollId, frameId){
    var self = this;
    this._bindContentPaneModelChanges({include_children:true}, function(rollModel, response){
      self._activateFrameInRollById(rollModel, frameId);
    });
    this._setupRollView(rollId);
  },

  displayRoll : function(rollId, title){
    this._bindContentPaneModelChanges({include_children:true}, this._activateFirstRollFrame);
    this._setupRollView(rollId, {updateRollTitle:true});
  },

  displayDashboard : function(){
    this._bindContentPaneModelChanges({include_children:true}, this._activateFirstDashboardFrame);
    this._setupTopLevelViews();
    shelby.models.dashboard = new libs.shelbyGT.DashboardModel();
    shelby.models.guide.set({'contentPaneView': libs.shelbyGT.DashboardView, 'contentPaneModel': shelby.models.dashboard});
  },

  displayRollList : function(){
    this._bindContentPaneModelChanges({include_rolls:true});
    this._setupTopLevelViews();
    shelby.models.guide.set({'contentPaneView': libs.shelbyGT.RollListView, 'contentPaneModel': shelby.models.user});
  },

  displaySaves : function(){
    var watchLaterRoll = shelby.models.user.getWatchLaterRoll();
    if (watchLaterRoll) {
      this._bindContentPaneModelChanges({include_children:true});
      this._setupRollView(watchLaterRoll.id);
    } else {
      alert("Sorry, you don't have a saves roll.");
      this.navigate('', {trigger:true, replace:true});
    }
  },

  doNothing : function(){
    console.log('bad url');
  },

  //---
  //NAVIGATION HELPERS
  //---

  // param: options -- accepts the same options as the Backbone.Router.navigate() param options
  navigateToRoll : function (roll, options) {
    var rollTitle = roll.get('title');
    this.navigate('roll/'+roll.id+(rollTitle ? '/' + libs.utils.String.toUrlSegment(rollTitle) : ''), options);
  },

  //---
  //PRIVATE METHODS
  //---
  
  _fetchModel : function(model, fetchParams, cb){
      // whenever a new model (roll or dashboard) is set on the content pane, fetch (possibly re-loading) its contents
      // this way, the content pane will render with the latest contents of that roll or dashboard
      model.fetch({data:fetchParams, success:cb});
  },

  _bindContentPaneModelChanges : function(fetchParams, cb){
    var self = this;
    shelby.models.guide.unbind('change:contentPaneModel');

    shelby.models.guide.bind('change:contentPaneModel', function(guideModel, contentPaneModel){
      self._fetchModel(contentPaneModel, fetchParams, cb);
    });
    
  },

  _activateFirstRollFrame : function(rollModel, response) {
    var firstFrame = rollModel.get('frames').first();
    shelby.models.guide.set('activeFrameModel', firstFrame);
  },

  _activateFrameInRollById : function(rollModel, frameId) {
    var frame;
    if (frame = rollModel.get('frames').get(frameId)) {
      shelby.models.guide.set('activeFrameModel', frame);
    } else {
      // url frame id doesn't exist in this roll - notify user, then redirect to the default view of the roll
      window.alert("Sorry, the video you were looking for doesn't exist.")
      this.navigateToRoll(rollModel, {trigger:true, replace:true});
    }
  },

  _activateFirstDashboardFrame : function(dashboardModel, response) {
    var firstDashboardEntry;
    if (firstDashboardEntry = dashboardModel.get('dashboard_entries').first()) {
      shelby.models.guide.set('activeFrameModel', firstDashboardEntry.get('frame'));
    }
  },

  _setupTopLevelViews : function(){
    shelby.views.rollHeader && shelby.views.rollHeader.hide();
    // header & menu render on instantiation //
    shelby.views.header = shelby.views.header || new libs.shelbyGT.GuideHeaderView({model:shelby.models.user});
    shelby.views.menu = shelby.views.menu || new libs.shelbyGT.MenuView();
    //--------------------------------------//
    shelby.views.guide = shelby.views.guide || new libs.shelbyGT.GuideView({model:shelby.models.guide});
    shelby.views.video = shelby.views.video || new libs.shelbyGT.VideoDisplayView({model:shelby.models.guide, playbackState:shelby.models.playbackState});
  },
  
  _setupRollView : function(rollId, options){
    var options = _({updateRollTitle:false}).extend(options);

    this._setupTopLevelViews();
    var roll = new libs.shelbyGT.RollModel({id:rollId});
    if (options.updateRollTitle) {
      // correct the roll title in the url if it changes (especially on first load of the roll)
      roll.bind('change:title', function(){this.navigateToRoll(roll,{trigger:false,replace:true});}, this);
    }
    shelby.views.rollHeader =  shelby.views.rollHeader || new libs.shelbyGT.RollHeaderView();
    shelby.views.rollHeader.show();
    shelby.models.guide.set({'contentPaneView': libs.shelbyGT.RollView, 'contentPaneModel': roll});
  }

});
