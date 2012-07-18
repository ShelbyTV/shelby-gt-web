libs.shelbyGT.DynamicRouter = Backbone.Router.extend({

  routes : {
    "roll/:rollId/frame/:frameId" : "displayFrameInRoll",
    "roll/:rollId/:title" : "displayRoll",
    "roll/:rollId/" : "displayRoll",
    "roll/:rollId" : "displayRoll",
    "rollFromFrame/:frameId" : "displayRollFromFrame",
    "isolated_roll/:rollId" : "displayIsolatedRoll",
    "isolated_roll/:rollId/frame/:frameId" : "displayIsolatedRoll",
    "user/:id/personal_roll" : "displayUserPersonalRoll",
    "stream" : "displayDashboard",
    "rolls/:content" : "displayRollList",
    "rolls" : "displayRollList",
    "saves" : "displaySaves",
    "preferences" : "displayUserPreferences",
    "help" : "displayHelp",
    "team" : "displayTeam",
    "legal" : "displayLegal",
    "" : "displayDashboard",
    "*url" : "doNothing"
  },

  //---
  //Breadcrumbs
  //---
  initialize : function(){
    shelby.routeHistory = [];
    this.bind("all", function(route){ shelby.routeHistory.push(route); });
  },

  //---
  //ROUTE HANDLERS
  //---

  displayFrameInRoll : function(rollId, frameId, params, options, topLevelViewsOptions){
    // default options
    options = _.chain({}).extend(options).defaults({
      rerollSuccess : (params && params.reroll_success === "true")
    }).value();

    var self = this;
    // if there are params that specify this was a roll invite...
    //  make the call to add the user to the roll...
    //  then show them the roll
    // otherwise just show the roll view
    if (shelby.userSignedIn() && params && params.gt_ref_roll){
      var rollToJoin = new libs.shelbyGT.RollModel({id:params.gt_ref_roll});
      rollToJoin.joinRoll(function(){
        self._setupRollViewWithCallback(rollId, frameId, options, topLevelViewsOptions);
      });
    } else {
      self._setupRollViewWithCallback(rollId, frameId, options, topLevelViewsOptions);
    }
  },

  displayRoll : function(rollId, title, params, options, topLevelViewsOptions){
    // default options
    var defaultOnRollFetch = null;
    if (!shelby.models.guide.get('activeFrameModel')) {
      // if nothing is already playing, start playing the first frame in the roll on load
      defaultOnRollFetch = this._activateFirstRollFrame;
    }
    
    options = _.chain({}).extend(options).defaults({
      updateRollTitle: true,
      onRollFetch: defaultOnRollFetch,
      data: {include_children:true}
    }).value();

    this._setupRollView(rollId, title, {
      updateRollTitle: options.updateRollTitle,
      data: options.data,
      onRollFetch: options.onRollFetch
    }, topLevelViewsOptions);
  },
  
  displayIsolatedRoll : function(rollId, frameId){
    // Adjust *how* a few details are displayed via CSS
    $('body').addClass('isolated-roll');

    // Adjust *what* is displayed
    var options = {updateRollTitle:false};

    if (frameId){
      this.displayFrameInRoll(rollId, frameId, null, options, {isIsolatedRoll : true});
    } else {
      this.displayRoll(rollId, null, null, options, {isIsolatedRoll : true});
    }
      
    // N.B. We are hiding Frame's tool bar and conversation via CSS.
    // Doing so programatically seemed overly involved and complex when a few CSS rules would do
  },

  displayRollFromFrame : function(frameId, params) {
    var self = this;
    var frameModel = new libs.shelbyGT.FrameModel({id:frameId});
    frameModel.fetch({
      success : function(frameModel, response) {
        if (frameModel.has('roll_id')) {
          self.navigate('roll/' + frameModel.get('roll_id'), {trigger:true,replace:true});
        } else {
          // the frame doesn't have a roll, so navigate to the stream/dashboard which is its 'source'
          self.navigate('', {trigger:true,replace:true});
        }
      }
    });
  },

  displayUserPersonalRoll : function(userId, params){
    var self = this;
    var roll = new libs.shelbyGT.UserPersonalRollModel({creator_id:userId});
    //we don't have enough information about the roll to proceed, so we have to do a preliminary fetch of
    //the roll info before we can continue
    roll.fetchWithoutFrames({
      success : function() {
        self.displayRoll(roll, 'personal_roll', params, {
          updateRollTitle : false
        });
      }
    });
  },

  _displayEntryInDashboard : function(entryId, params, options){
    // default options
    options = options || {};

    var self = this;
    this.displayDashboard(params, {
      data: {
        since_id : entryId,
        include_children : true
      },
      onDashboardFetch: function(dashboardModel, response){
        self._activateEntryInDashboardById(dashboardModel, entryId);
      }
    });
  },

  displayDashboard : function(params, options){
    this._setupTopLevelViews();
    this._fetchDashboard(options);
  },

  _fetchDashboard : function(options) {
    // default options
    var defaultOnDashboardFetch = null;
    if (!shelby.models.guide.get('activeFrameModel')) {
      // if nothing is already playing, start playing the first frame in the dashboard on load
      defaultOnDashboardFetch = this._activateFirstDashboardVideoFrame;
    }
    var self = this;
    options = _.chain({}).extend(options).defaults({
      onDashboardFetch: function(dashboardModel, response){
        if (response.result.length) {
          defaultOnDashboardFetch && defaultOnDashboardFetch.call(self, dashboardModel, response);
        } else {
          setTimeout(function(){
            if (shelby.models.guide.get('displayState') == libs.shelbyGT.DisplayState.dashboard) {
              self._fetchDashboard(options);
            }
          }, 400);
        }

      },
      data: {
          include_children : true
      },
      displayInGuide : true
    }).value();

    var fetchOptions = {data: options.data};
    fetchOptions.data.limit = shelby.config.pageLoadSizes.dashboard;
    fetchOptions.success = options.onDashboardFetch;
    // uncomment to emulate a new user sign-up w/ no data
    // fetchOptions.data.limit = Math.random() < 0.6 ? 20 : 0;

    shelby.models.dashboard= new libs.shelbyGT.DashboardModel();

    if (options.displayInGuide) {
      shelby.models.guide.set({
        'displayState' : libs.shelbyGT.DisplayState.dashboard,
        'sinceId' : options.data.since_id ? options.data.since_id : null,
        'pollAttempts' : shelby.models.guide.get('pollAttempts') ? shelby.models.guide.get('pollAttempts')+1 : 1
      });
      
      // filtering out faux users so as a team we can interact more easily 
      //   with real users easily as they come in.
      if ($.getUrlParam("real") == 1){ 
        shelby.views.guide._listView.updateFilter(function(model){
          return model.get('frame').get('creator').get('faux') != 1;
        });
      } 
      // filtering out non-gt_enabled users
      if ($.getUrlParam("gt") == 1){
        shelby.views.guide._listView.updateFilter(function(model){
          return model.get('frame').get('creator').get('gt_enabled') == true;
        });
      }
      
      var oneTimeSpinnerState = new libs.shelbyGT.SpinnerStateModel();
      shelby.views.guideSpinner.setModel(oneTimeSpinnerState);
      $.when(shelby.models.dashboard.fetch(fetchOptions)).always(function(response, callbackName, jqXHR){
        // if we're going to re-poll for stream data, don't hide the spinner
        if (callbackName == 'success' && response && response.result && response.result.length == 0) {
          return;
        }
        oneTimeSpinnerState.set('show', false);
        shelby.models.guide.set('disableSmartRefresh', true);
      });
    } else {
      shelby.models.dashboard.fetch(fetchOptions);
    }
  },

  displayRollList : function(content){
    //default parameters
    if (!content) {
      content = libs.shelbyGT.GuidePresentation.content.rolls.myRolls;
    }

    this._setupTopLevelViews();

    switch (content) {
      case libs.shelbyGT.GuidePresentation.content.rolls.people:
      case libs.shelbyGT.GuidePresentation.content.rolls.myRolls:
      case libs.shelbyGT.GuidePresentation.content.rolls.browse:
        shelby.models.guide.set({'rollListContent':content}, {silent:true});
        break;
      default:
        this.navigate('rolls',{trigger:true,replace:true});
        return;
    }

    shelby.models.guide.set({displayState:libs.shelbyGT.DisplayState.rollList}, {silent:true});
    shelby.models.guide.change();
  },

  displaySaves : function(){
    var watchLaterRoll = shelby.models.user.get('watch_later_roll');
    if (watchLaterRoll) {
      this.displayRoll(watchLaterRoll.id, watchLaterRoll.get('title'), null, {
        updateRollTitle: false
      });
    } else {
      shelby.alert("Sorry, you don't have a saves roll.");
      this.navigate('', {trigger:true, replace:true});
    }
  },

  displayUserPreferences : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set('displayState', libs.shelbyGT.DisplayState.userPreferences);
  },

  displayHelp : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set('displayState', libs.shelbyGT.DisplayState.help);
  },

  displayTeam : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set('displayState', libs.shelbyGT.DisplayState.team);
  },

  displayLegal : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set('displayState', libs.shelbyGT.DisplayState.legal);
  },
  
  doNothing : function(url){
    console.log('unhandled url', url);
  },

  displayRollListAndPlayStream : function(params){
    var self = this;
    this.displayRollList();
    this._fetchDashboard({
      displayInGuide:false,
      onDashboardFetch: function(dashboardModel, response){
        self._activateFirstDashboardVideoFrame(dashboardModel, response);
      }});
  },

  //---
  //NAVIGATION HELPERS
  //---

  // param: options -- accepts the same options as the Backbone.Router.navigate() param options
  navigateToRoll : function (roll, options) {
    var rollTitle = roll.get('title');
    this.navigate('roll/' + roll.id + (rollTitle ? '/' + libs.utils.String.toUrlSegment(rollTitle) : ''), options);
  },

  _activateFirstRollFrame : function(rollModel, response) {
    var firstFrame = rollModel.get('frames').first();
    if (firstFrame) {
      shelby.models.guide.set('activeFrameModel', firstFrame);
    }
  },

  _activateFrameInRollById : function(rollModel, frameId) {
    var frame;
    if (frame = rollModel.get('frames').get(frameId)) {
      shelby.models.guide.set('activeFrameModel', frame);
    } else {
      // url frame id doesn't exist in this roll - notify user, then redirect to the default view of the roll
      shelby.alert("Sorry, the video you were looking for doesn't exist in this roll.");
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

  _activateEntryInDashboardById : function(dashboardModel, entryId) {
    var entry;
    if (entry = dashboardModel.get('dashboard_entries').get(entryId)) {
      shelby.models.guide.set('activeFrameModel', entry.get('frame'));
    } else {
      // url entry id doesn't exist in the dashboard - notify user, then redirect to the dashboard
      shelby.alert("Sorry, the entry you were looking for doesn't exist in your stream.");
      this.navigate("/", {trigger:true, replace:true});
    }
  },

  _setupTopLevelViews : function(options){
    // default options
    options = _.chain({}).extend(options).defaults({
      isIsolatedRoll : false
    }).value();
    
    shelby.models.guide.set('displayIsolatedRoll', options.isIsolatedRoll);

    this._setupAnonUserViews(options);
    shelby.views.notificationOverlayView = shelby.views.notificationOverlayView || new libs.shelbyGT.notificationOverlayView({model:shelby.models.notificationState});
    shelby.views.contextOverlay = shelby.views.contextOverlay || new libs.shelbyGT.ContextOverlayView({guide:shelby.models.guide});
    shelby.views.prerollVideoInfo = shelby.views.prerollVideoInfo || new libs.shelbyGT.PrerollVideoInfoView({guide:shelby.models.guide, playbackState:shelby.models.playbackState});
    shelby.views.header = shelby.views.header || new libs.shelbyGT.GuideHeaderView({model:shelby.models.user});
    shelby.views.guidePresentationSelector = shelby.views.guidePresentationSelector || new libs.shelbyGT.GuidePresentationSelectorView({model:shelby.models.guide});
    shelby.views.itemHeader = shelby.views.itemHeader || new libs.shelbyGT.ItemHeaderView({model:shelby.models.guide});
    shelby.views.rollActionMenu = shelby.views.rollActionMenu || new libs.shelbyGT.RollActionMenuView({model:shelby.models.guide, viewState:new libs.shelbyGT.RollActionMenuViewStateModel()});
    shelby.views.addVideo = shelby.views.addVideo || new libs.shelbyGT.addVideoView({model:shelby.models.guide});
    //--------------------------------------//
    shelby.views.guide = shelby.views.guide ||
        new libs.shelbyGT.GuideView({model:shelby.models.guide});
    shelby.views.video = shelby.views.video ||
        new libs.shelbyGT.VideoDisplayView({model:shelby.models.guide, playbackState:shelby.models.playbackState, userDesires:shelby.models.userDesires});
    shelby.views.videoControls = shelby.views.videoControls ||
        new libs.shelbyGT.VideoControlsView({playbackState:shelby.models.playbackState, userDesires:shelby.models.userDesires});
    shelby.views.miniVideoProgress = shelby.views.miniVideoProgress ||
        new libs.shelbyGT.MiniVideoProgress({playbackState:shelby.models.playbackState});
    shelby.views.guideSpinner =  shelby.views.guideSpinner ||
        new libs.shelbyGT.SpinnerView({el:'#guide', size:'large'});
    shelby.views.keyboardControls = shelby.views.keyboardControls ||
        new libs.shelbyGT.KeyboardControlsView();
  },

  _setupAnonUserViews : function(options){
    options = _.chain({}).extend(options).defaults({
      isIsolatedRoll : false
    }).value();
    shelby.views.anonBanner = shelby.views.anonBanner || new libs.shelbyGT.AnonBannerView();
    shelby.views.anonBanner.render();
  },
  
  _setupRollView : function(roll, title, options, topLevelViewsOptions){
    this._setupTopLevelViews(topLevelViewsOptions);
    
    // default options
    options = _.chain({}).extend(options).defaults({
      updateRollTitle: false,
      onRollFetch: null,
      data: null
    }).value();
    
    var rollModel;
    if (typeof(roll) === 'string') {
      // if roll is a string, its the id of the roll to display, so get or construct a model for that id
      // if the roll has been loaded previously, we can find it in the Backbone Relational Store
      var followedRoll = Backbone.Relational.store.find(libs.shelbyGT.RollModel, roll);
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
      rollModel.bind('change:title', function(){
        rollModel.unbind('change:title'),
        this.navigateToRoll(rollModel,{trigger:false,replace:true});
      }, this);
    }

    var displayState;
    if (rollModel.id != shelby.models.user.get('watch_later_roll').id) {
      displayState = 'standardRoll';
    } else {
     // the watch later roll is not sharable
     displayState = 'watchLaterRoll';
    }

    shelby.models.guide.set({
      'displayState': displayState,
      'currentRollModel': rollModel,
      'sinceId' : options.data.since_id ? options.data.since_id : null
    });
    var fetchOptions = {data: options.data};
    fetchOptions.data.limit = shelby.config.pageLoadSizes.roll;
    if (typeof(options.onRollFetch) === 'function') {
      fetchOptions.success = options.onRollFetch;
    }
    var oneTimeSpinnerState = new libs.shelbyGT.SpinnerStateModel();
    shelby.views.guideSpinner.setModel(oneTimeSpinnerState);
    $.when(rollModel.fetch(fetchOptions)).always(function(){oneTimeSpinnerState.set('show', false);});
  },
  
  _setupRollViewWithCallback : function(rollId, frameId, options, topLevelViewsOptions){
    var self = this;
    this._setupRollView(rollId, null, {
      data: {
        since_id : frameId,
        include_children : true
      },
      onRollFetch: function(rollModel, response){
        if(!options.rerollSuccess){
          self._activateFrameInRollById(rollModel, frameId);
        }
      }
    }, topLevelViewsOptions);
  }
  
});
