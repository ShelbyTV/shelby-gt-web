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
    if (rollId != shelby.models.user.get('watch_later_roll').id) {
      var self = this;
      this._setupRollView(rollId, {
        data: {include_children:true},
        onRollFetch: function(rollModel, response){
          self._activateFrameInRollById(rollModel, frameId);
        }
      });
    } else {
      // if this is the watch later roll, reroute to the special route for that roll
      this.navigate('saves', {trigger:true,replace:true});
    }
  },

  displayRoll : function(rollId, title){
    if (rollId != shelby.models.user.get('watch_later_roll').id) {
      this._setupRollView(rollId, {
        updateRollTitle: true,
        data: {include_children:true},
        onRollFetch: this._activateFirstRollFrame
      });
    } else {
      // if this is the watch later roll, reroute to the special handling for that roll
      this.navigate('saves', {trigger:true,replace:true});
    }
  },

  displayDashboard : function(){
    this._setupTopLevelViews();
    shelby.models.dashboard = new libs.shelbyGT.DashboardModel();
    shelby.models.guide.set({
      'displayState': libs.shelbyGT.DisplayState.dashboard
    });
    shelby.models.dashboard.fetch({
      data: {include_children:true},
      success: this._activateFirstDashboardVideoFrame
    });
  },

  displayRollList : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set({
      'displayState': libs.shelbyGT.DisplayState.rollList
    });
    shelby.models.user.fetch({
      data: {include_rolls:true}
    });
  },

  displaySaves : function(){
    var watchLaterRoll = shelby.models.user.get('watch_later_roll');
    if (watchLaterRoll) {
      this._setupRollView(watchLaterRoll, {
        data: {include_children:true}
      });
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
      window.alert("Sorry, the video you were looking for doesn't exist.");
      this.navigateToRoll(rollModel, {trigger:true, replace:true});
    }
  },

  _activateFirstDashboardVideoFrame : function(dashboardModel, response) {
    var firstDashboardEntry = dashboardModel.get('dashboard_entries').find(function(entry){
      return entry.get('frame') && entry.get('frame').get('video');
    });
    if (firstDashboardEntry) {
      shelby.models.guide.set('activeFrameModel', firstDashboardEntry.get('frame'));
    }
  },

  _setupTopLevelViews : function(){
    // header & menu render on instantiation //
    shelby.views.header = shelby.views.header || new libs.shelbyGT.GuideHeaderView({model:shelby.models.user});
    shelby.views.menu = shelby.views.menu || new libs.shelbyGT.MenuView({model:shelby.models.guide});
    //--------------------------------------//
    shelby.views.guide = shelby.views.guide || new libs.shelbyGT.GuideView({model:shelby.models.guide});
    shelby.views.video = shelby.views.video || new libs.shelbyGT.VideoDisplayView({model:shelby.models.guide});
  },
  
  _setupRollView : function(roll, options){
    if (!options) {
      options = {};
    }
    _(options).defaults({
        updateRollTitle: false,
        onRollFetch: null,
        data: null
    });

    this._setupTopLevelViews();
    var rollModel;
    if (typeof(roll) === 'string') {
      // if roll is a string, its the id of the roll to display, so get or construct a model for that id
      var followedRoll = shelby.models.user.get('roll_followings').find(function(rollToCompare){
        // if the roll is one the user follows, we want to use the existing model in the user's roll followings collection
        return rollToCompare.id == roll;
      });
      rollModel = followedRoll || new libs.shelbyGT.RollModel({id:roll});
    } else {
      // if roll is a Model, just use it
      rollModel = roll;
    }
    if (options.updateRollTitle) {
      // correct the roll title in the url if it changes (especially on first load of the roll)
      rollModel.bind('change:title', function(){this.navigateToRoll(rollModel,{trigger:false,replace:true});}, this);
    }

    // the watch later roll is not sharable
    var displayState = rollModel.id != shelby.models.user.get('watch_later_roll').id ? 'standardRoll' : 'watchLaterRoll';

    shelby.models.guide.set({
      'displayState': displayState,
      'currentRollModel': rollModel
    });
    rollModel.fetch({
      data: options.data,
      success: options.onRollFetch
    });
  }

});
