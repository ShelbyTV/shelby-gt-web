libs.shelbyGT.DynamicRouter = Backbone.Router.extend({

  routes : {
    "roll/:rollId/frame/:frameId/rollit" : "displayFrameAndActivateRollingView",
    "roll/:rollId/frame/:frameId" : "displayFrameInRoll",
    "roll/:rollId/:title" : "displayRoll",
    "roll/:rollId/" : "displayRoll",
    "roll/:rollId" : "displayRoll",
    "carousel/:rollId/frame/:frameId" : "displayFrameInRollInCarousel",
    "carousel/:rollId/:title" : "displayRollInCarousel",
    "carousel/:rollId/" : "displayRollInCarousel",
    "carousel/:rollId" : "displayRollInCarousel",
    "rolls" : "displayRollList",
    "saves" : "displaySaves",
    "preferences" : "displayUserPreferences",
    "help" : "displayHelp",
    "team" : "displayTeam",
    "copyright" : "displayCopyright",
    "" : "displayDashboard",
    "*url" : "doNothing"
  },

  //---
  //ROUTE HANDLERS
  //---

  displayFrameAndActivateRollingView : function(rollId, frameId){
    this.displayFrameInRoll(rollId, frameId, {activateRollingView:true});
  },

  displayFrameInRoll : function(rollId, frameId, options){
    var defaults = {
      activateRollingView : false
    };
    if (!options) {
      options = defaults;
    } else {
      _(options).defaults(defaults);
    }

    var self = this;
    this._setupRollView(rollId, null, {
      data: {include_children:true},
      onRollFetch: function(rollModel, response){
        self._activateFrameInRollById(rollModel, frameId, options.activateRollingView);
      }
    });
  },

  displayRoll : function(rollId, title, options){
    var defaultOnRollFetch;
    if (shelby.models.guide.get('activeFrameModel')) {
      // if something is already playing and it is in the roll that loads, scroll to it
      defaultOnRollFetch = this._scrollToActiveFrameView;
    } else {
      // if nothing is already playing, start playing the first frame in the roll on load
      defaultOnRollFetch = this._activateFirstRollFrame;
    }
    var defaults = {
      updateRollTitle: true,
      onRollFetch: defaultOnRollFetch,
      data: {include_children:true}
    };
    if (!options) {
      options = defaults;
    } else {
      _(options).defaults(defaults);
    }

    this._setupRollView(rollId, title, {
      updateRollTitle: options.updateRollTitle,
      data: options.data,
      onRollFetch: options.onRollFetch
    });
  },

  displayFrameInRollInCarousel : function(rollId, frameId){
    if (shelby.models.user.followsRoll(rollId)) {
      shelby.models.guide.set('insideRollList', true);
      this.displayFrameInRoll(rollId, frameId);
    } else {
      // if the user doesn't follow this roll they can't see it inside the carousel,
      // so just redirect to the normal roll/id/frame/id route
      this.navigate('roll/' + rollId + '/frame/' + frameId, {trigger:true,replace:true});
    }
  },

  displayRollInCarousel : function(rollId, title){
    if (shelby.models.user.followsRoll(rollId)) {
      shelby.models.guide.set('insideRollList', true);
      this.displayRoll(rollId, title);
    } else {
      // if the user doesn't follow this roll they can't see it inside the carousel,
      // so just redirect to the normal roll route
      this.navigate('roll/' + rollId + (title ? '/' + title : ''), {trigger:true,replace:true});
    }
  },

  displayDashboard : function(){
    this._setupTopLevelViews();
    shelby.models.dashboard = new libs.shelbyGT.DashboardModel();
    shelby.models.guide.set({
      'displayState' : libs.shelbyGT.DisplayState.dashboard,
      'insideRollList' : false
    });
    var onSuccess;
    if (shelby.models.guide.get('activeFrameModel')) {
      // if something is already playing and it is in the dashboard, scroll to it
      onSuccess = this._scrollToActiveFrameView;
    } else {
      // if nothing is already playing, start playing the first frame in the dashboard on load
      onSuccess = this._activateFirstDashboardVideoFrame;
    }
    shelby.models.dashboard.fetch({
      data: {include_children:true},
      success: onSuccess
    });
  },

  displayRollList : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set({
      'displayState' : libs.shelbyGT.DisplayState.rollList,
      'insideRollList' : true
    });
    shelby.models.user.fetch({
      data: {include_rolls:true}
    });
  },

  displaySaves : function(){
    var watchLaterRoll = shelby.models.user.get('watch_later_roll');
    if (watchLaterRoll) {
      this.displayRoll(watchLaterRoll.id, watchLaterRoll.get('title'), {
        updateRollTitle: false
      });
    } else {
      alert("Sorry, you don't have a saves roll.");
      this.navigate('', {trigger:true, replace:true});
    }
  },

  displayUserPreferences : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set({
      'displayState' : libs.shelbyGT.DisplayState.userPreferences,
      'insideRollList' : false
    });
  },

  displayHelp : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set({
      'displayState' : libs.shelbyGT.DisplayState.help,
      'insideRollList' : false
    });
  },

  displayTeam : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set({
      'displayState' : libs.shelbyGT.DisplayState.team,
      'insideRollList' : false
    });
  },

  displayCopyright : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set({
      'displayState' : libs.shelbyGT.DisplayState.copyright,
      'insideRollList' : false
    });
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
    var prefix = shelby.models.guide.get('insideRollList') ? 'carousel/' : 'roll/';
    this.navigate(prefix + roll.id + (rollTitle ? '/' + libs.utils.String.toUrlSegment(rollTitle) : ''), options);
  },

  _activateFirstRollFrame : function(rollModel, response) {
    var firstFrame = rollModel.get('frames').first();
    if (firstFrame) {
      shelby.models.guide.set('activeFrameModel', firstFrame);
    }
  },

  _activateFrameInRollById : function(rollModel, frameId, activateRollingView) {
    var frame;
    if (frame = rollModel.get('frames').get(frameId)) {
      shelby.models.guide.set('activeFrameModel', frame);
      if (activateRollingView) {
        shelby.views.guide.rollActiveFrame();
      }
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

  _scrollToActiveFrameView : function(){
    shelby.views.guide.scrollToActiveFrameView();
  },

  _setupTopLevelViews : function(){
    shelby.models.user.get('anon') && this._setupAnonUserViews();
    // header & menu render on instantiation //
    shelby.views.header = shelby.views.header ||
        new libs.shelbyGT.GuideHeaderView({model:shelby.models.user});
    shelby.views.menu = shelby.views.menu ||
        new libs.shelbyGT.MenuView({model:shelby.models.guide});
    //--------------------------------------//
    shelby.views.guide = shelby.views.guide ||
        new libs.shelbyGT.GuideView({model:shelby.models.guide});
    shelby.views.video = shelby.views.video ||
        new libs.shelbyGT.VideoDisplayView({model:shelby.models.guide, playbackState:shelby.models.playbackState, userDesires:shelby.models.userDesires});
    shelby.views.videoControls = shelby.views.videoControls ||
        new libs.shelbyGT.VideoControlsView({playbackState:shelby.models.playbackState, userDesires:shelby.models.userDesires});
    if (!shelby.views.guideSpinner){
      shelby.views.guideSpinner = new libs.shelbyGT.SpinnerView({el:'#guide', spinOpts:libs.shelbyGT.DisplayState.guideSpinnerOpts});
    }
    shelby.views.guideSpinner.show();
  },

  _setupAnonUserViews : function(){
    // TODO define this view
    shelby.views.anonBanner = shelby.views.anonBanner || new libs.shelbyGT.AnonBannerView();
  },
  
  _setupRollView : function(roll, title, options){
    var defaults = {
      updateRollTitle: false,
      onRollFetch: null,
      data: null
    };
    if (!options) {
      options = defaults;
    } else {
      _(options).defaults(defaults);
    }

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
      // if we already have a title for the roll, and it doesn't match the title in the url, correct the url
      if (rollModel.get('title') && rollModel.get('title') != title) {
        this.navigateToRoll(rollModel,{trigger:false,replace:true});
      }
      // correct the roll title in the url if it changes (especially on first load of the roll)
      rollModel.bind('change:title', function(){this.navigateToRoll(rollModel,{trigger:false,replace:true});}, this);
    }

    // the watch later roll is not sharable
    var displayState = rollModel.id != shelby.models.user.get('watch_later_roll').id ? 'standardRoll' : 'watchLaterRoll';

    shelby.models.guide.set({
      'displayState': displayState,
      'currentRollModel': rollModel
    });
    var fetchOptions = {data: options.data};
    if (typeof(options.onRollFetch) === 'function') {
      fetchOptions.success = options.onRollFetch;
    }
    rollModel.fetch(fetchOptions);
  }

});
