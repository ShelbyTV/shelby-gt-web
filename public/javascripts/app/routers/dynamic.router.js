libs.shelbyGT.DynamicRouter = Backbone.Router.extend({

  routes : {
    "roll/:rollId/frame/:frameId/rollit" : "displayFrameAndActivateRollingView",
    "roll/:rollId/frame/:frameId" : "displayFrameInRoll",
    "roll/:rollId/:title" : "displayRoll",
    "roll/:rollId/" : "displayRoll",
    "roll/:rollId" : "displayRoll",
    "rollFromFrame/:frameId" : "displayRollFromFrame",
    "isolated_roll/:rollId" : "displayIsolatedRoll",
    "isolated_roll/:rollId/*params" : "displayIsolatedRoll",
    "user/:id/personal_roll" : "displayUserPersonalRoll",
    "stream/entry/:entryId/rollit" : "displayEntryAndActivateRollingView",
    "stream" : "displayDashboard",
    "rolls" : "displayRollList",
    "saves" : "displaySaves",
    "preferences" : "displayUserPreferences",
    "help" : "displayHelp",
    "team" : "displayTeam",
    "legal" : "displayLegal",
    "" : "displayRollListAndPlayStream",
    "*url" : "doNothing"
  },

  //---
  //ROUTE HANDLERS
  //---

  displayFrameAndActivateRollingView : function(rollId, frameId, params){
    this.displayFrameInRoll(rollId, frameId, params, {activateRollingView:true});
  },

  displayFrameInRoll : function(rollId, frameId, params, options){
    // default options
    options = _.chain({}).extend(options).defaults({
      activateRollingView : false
    }).value();

    var self = this;
    // if there are params that specify this was a roll invite...
    //  make the call to add the user to the roll...
    //  then show them the roll
    // otherwise just show the roll view
    if (shelby.userSignedIn() && params && params.gt_ref_roll){
      shelby.models.user.addUserToRoll(params.gt_ref_roll, function(){
        $('.rolls-add').text('Leave')['addClass']('rolls-leave');
        self._setupRollViewWithCallback(rollId, frameId, options);
      });
    }
    else {
      self._setupRollViewWithCallback(rollId, frameId, options);
    }
  },

  displayRoll : function(rollId, title, params, options, topLevelViewsOptions){
    // default options
    var defaultOnRollFetch;
    if (shelby.models.guide.get('activeFrameModel')) {
      // if something is already playing and it is in the roll that loads, scroll to it
      defaultOnRollFetch = this._scrollToActiveGuideListItemView;
    } else {
      // if nothing is already playing, start playing the first frame in the roll on load
      defaultOnRollFetch = this._activateFirstRollFrame;
    }
    options = _.chain({}).extend(options).defaults({
      updateRollTitle: true,
      onRollFetch: defaultOnRollFetch,
      data: {include_children:true},
      isUserPersonalRoll: false
    }).value();

    this._setupRollView(rollId, title, {
      updateRollTitle: options.updateRollTitle,
      data: options.data,
      onRollFetch: options.onRollFetch,
      isUserPersonalRoll: options.isUserPersonalRoll
    }, topLevelViewsOptions);
  },
  
  displayIsolatedRoll : function(rollId){
    // Adjust *how* a few details are displayed via CSS
    $('body').addClass('isolated-roll');
    
    // Adjust *what* is displayed
    this.displayRoll(
      rollId, 
      null, 
      null, 
      {updateRollTitle:false}, 
      { hideGuideHeader:true, 
        hideMenu:true, 
        hideAnonUserView:true,
        hideRollHeader:true,
        filterControlsOptions:{rollFilterControlsViewOptions:{hideNav:true}}
      });
      
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
    var roll = new libs.shelbyGT.UserPersonalRollModel({creator_id:userId});
    this.displayRoll(roll, 'personal_roll', params, {
      updateRollTitle : false,
      isUserPersonalRoll : true
    });
  },

  displayEntryAndActivateRollingView : function(entryId, params){
    this._displayEntryInDashboard(entryId, params, {activateRollingView:true});
  },

  _displayEntryInDashboard : function(entryId, params, options){
    // default options
    options = _.chain({}).extend(options).defaults({
      activateRollingView : false
    }).value();

    var self = this;
    this.displayDashboard(params, {
      data: {
        since_id : entryId,
        include_children : true
      },
      onDashboardFetch: function(dashboardModel, response){
        self._activateEntryInDashboardById(dashboardModel, entryId, options.activateRollingView);
      }
    });
  },

  displayDashboard : function(params, options){
    // FOR IN PERSON USER TESTING
    // This is to alter ui of things like upvote, roll and comment elements
    this._testSwitchingfromQueryParams(params);

    this._setupTopLevelViews({showSpinner: true});
    this._fetchDashboard(options);
  },

  _fetchDashboard : function(options) {
    // default options
    var defaultOnDashboardFetch;
    if (shelby.models.guide.get('activeFrameModel')) {
      // if something is already playing and it is in the dashboard, scroll to it
      defaultOnDashboardFetch = this._scrollToActiveGuideListItemView;
    } else {
      // if nothing is already playing, start playing the first frame in the dashboard on load
      defaultOnDashboardFetch = this._activateFirstDashboardVideoFrame;
    }
    var self = this;
    options = _.chain({}).extend(options).defaults({
      onDashboardFetch: function(dashboardModel, response){
        if (response.result.length) {
          return defaultOnDashboardFetch.call(self, dashboardModel, response);
        }

        setTimeout(function(){
          self._fetchDashboard(options);
        }, 400);

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

    shelby.models.dashboard = new libs.shelbyGT.DashboardModel();
    if (options.displayInGuide) {
      shelby.models.guide.set({
        'displayState' : libs.shelbyGT.DisplayState.dashboard,
        'sinceId' : options.data.since_id ? options.data.since_id : null,
        'pollAttempts' : shelby.models.guide.get('pollAttempts') ? shelby.models.guide.get('pollAttempts')+1 : 1
      });
      this._hideSpinnerAfter( shelby.models.dashboard.fetch(fetchOptions) );
    } else {
      shelby.models.dashboard.fetch(fetchOptions);
    }
  },

  displayRollList : function(params){

    this._setupTopLevelViews({showSpinner: true});

    var displayState, rollCollection, fetchUrl;
    if (shelby.models.guidePresentation.get('content') == libs.shelbyGT.GuidePresentation.content.rolls.browse) {
      displayState = libs.shelbyGT.DisplayState.browseRollList;
      rollCollection = shelby.models.browseRolls;
      fetchUrl = shelby.config.apiRoot + '/roll/browse';
    } else {
      displayState = libs.shelbyGT.DisplayState.rollList;
      rollCollection = shelby.models.rollFollowings;
      fetchUrl = shelby.config.apiRoot + '/user/' + shelby.models.user.id + '/roll_followings';
    }

    shelby.models.guide.set('displayState', displayState);

    var self = this;
    this._hideSpinnerAfter((function(){
      return rollCollection.fetch({
        success : function(){
          self._scrollToActiveGuideListItemView();
        },
        url : fetchUrl
      });
    })());
  },

  displaySaves : function(){
    var watchLaterRoll = shelby.models.user.get('watch_later_roll');
    if (watchLaterRoll) {
      this.displayRoll(watchLaterRoll.id, watchLaterRoll.get('title'), null, {
        updateRollTitle: false
      });
    } else {
      alert("Sorry, you don't have a saves roll.");
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
        self._scrollToActiveGuideListItemView();
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

  _activateFrameInRollById : function(rollModel, frameId, activateRollingView) {
    var frame;
    if (frame = rollModel.get('frames').get(frameId)) {
      shelby.models.guide.set('activeFrameModel', frame);
      if (activateRollingView) {
        shelby.views.guide.rollActiveFrame();
      }
    } else {
      // url frame id doesn't exist in this roll - notify user, then redirect to the default view of the roll
      window.alert("Sorry, the video you were looking for doesn't exist in this roll.");
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

  _activateEntryInDashboardById : function(dashboardModel, entryId, activateRollingView) {
    var entry;
    if (entry = dashboardModel.get('dashboard_entries').get(entryId)) {
      shelby.models.guide.set('activeFrameModel', entry.get('frame'));
      if (activateRollingView) {
        shelby.views.guide.rollActiveFrame();
      }
    } else {
      // url entry id doesn't exist in the dashboard - notify user, then redirect to the dashboard
      window.alert("Sorry, the entry you were looking for doesn't exist in your stream.");
      this.navigate("/", {trigger:true, replace:true});
    }
  },

  _scrollToActiveGuideListItemView : function(){
    shelby.models.guide.set('tryAutoScroll', true);
  },

  _setupTopLevelViews : function(opts){
    opts = opts || {};
    
    if(shelby.models.user.get('anon') && !opts.hideAnonUserView){ this._setupAnonUserViews(); }
    // header & menu render on instantiation //
    shelby.views.commentOverlay = shelby.views.commentOverlay || new libs.shelbyGT.CommentOverlayView({model:shelby.models.guide});
    if(!opts.hideGuideHeader){
      shelby.views.header = shelby.views.header || new libs.shelbyGT.GuideHeaderView({model:shelby.models.user});
    }
    if(!opts.hideMenu){
      shelby.views.menu = shelby.views.menu || new libs.shelbyGT.MenuView({model:shelby.models.guide});
    }
    if(!opts.hideRollHeader){
      shelby.views.rollHeader = shelby.views.rollHeader || new libs.shelbyGT.RollHeaderView({model:shelby.models.guide});
    }
    if(!opts.hideGuidePresentationSelector){
      shelby.views.guidePresentationSelector = shelby.views.guidePresentationSelector || new libs.shelbyGT.GuidePresentationSelectorView({model:shelby.models.guidePresentation});
    }
    shelby.views.filterControls = shelby.views.filterControls || new libs.shelbyGT.FilterControlsView({model:shelby.models.guide, options:opts.filterControlsOptions});
    shelby.views.guideControls = shelby.views.guideControls || new libs.shelbyGT.GuideOverlayControls({userDesires:shelby.models.userDesires});
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
    if( opts.showSpinner ){ shelby.views.guideSpinner.show(); }
  },

  _setupAnonUserViews : function(){
    // TODO define this view
    shelby.views.anonBanner = shelby.views.anonBanner || new libs.shelbyGT.AnonBannerView();
  },
  
  _setupRollView : function(roll, title, options, topLevelViewsOptions){
    // default top-level views options
    topLevelViewsOptions = _.chain({}).extend(topLevelViewsOptions).defaults({
      showSpinner: true
    }).value();

    this._setupTopLevelViews(topLevelViewsOptions);
    
    // default options
    options = _.chain({}).extend(options).defaults({
      updateRollTitle: false,
      onRollFetch: null,
      data: null,
      isUserPersonalRoll: false
    }).value();
    
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

    var displayState;
    if (options.isUserPersonalRoll) {
      displayState = 'userPersonalRoll';
    } else if (rollModel.id != shelby.models.user.get('watch_later_roll').id) {
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
    this._hideSpinnerAfter( rollModel.fetch(fetchOptions) );
  },
  
  _setupRollViewWithCallback : function(rollId, frameId, options){
    var self = this;
    this._setupRollView(rollId, null, {
      data: {
        since_id : frameId,
        include_children : true
      },
      onRollFetch: function(rollModel, response){
        self._activateFrameInRollById(rollModel, frameId, options.activateRollingView);
      }
    });
  },

  //---
  //MISC HELPERS
  //---
  
  _testSwitchingfromQueryParams: function(params){
    // set shelby level setting establishing a "new" version of a ui el
    if (params && params.uitest == 'true') {
        shelby.commentUpvoteUITest = true;
    }
  },

  _hideSpinnerAfter: function(xhr){
    // Backbone's .fetch() calls & returns jQuery's .ajax which returns a jqXHR object: http://api.jquery.com/jQuery.ajax/#jqXHR
    // upon which we append another callback to hide the spinner shown earlier.
    xhr.done(function(){
      shelby.views.guideSpinner.hide();
    });
  }

});
