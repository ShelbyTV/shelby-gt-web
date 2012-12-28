libs.shelbyGT.DynamicRouter = Backbone.Router.extend({

  routes : {
    "send-invite"                          : "openInviteDisplayDashboard",
    "isolated-roll/:rollId"                : "displayIsolatedRoll",
    "isolated-roll/:rollId/frame/:frameId" : "displayIsolatedRoll",
    "roll/:rollId/frame/:frameId/comments" : "displayFrameInRollWithComments",
    "roll/:rollId/frame/:frameId"          : "displayFrameInRoll",
    "roll/:rollId/:title"                  : "displayRoll",
    "roll/:rollId"                         : "displayRoll",
    "rollFromFrame/:frameId"               : "displayRollFromFrame",
    "fb/genius/roll/:rollId"               : "displayFacebookGeniusRoll",
    "fb/genius/roll/:rollId/frame/:frameId": "displayFacebookGeniusRoll",
    "user/:id/personal_roll"               : "displayUserPersonalRoll",
    "explore"                              : "displayExploreView",
    "help"                                 : "displayHelp",
    "legal"                                : "displayLegal",
    "search"                               : "displaySearch",
    "me"                                   : "displayRollList",
    "onboarding/:stage"                    : "displayOnboardingView",
    "preferences"                          : "displayUserPreferences",
    "queue"                                : "displaySaves",
    "saves"                                : "displaySaves",
    "stream"                               : "displayDashboard",
    "team"                                 : "displayTeam",
    "tools"                                : "displayTools",
    ""                                     : "displayDashboard",
    ":userName"                            : "displayUserProfile",
    "*url"                                 : "doNothing"
  },

  //---
  //Breadcrumbs
  //---
  initialize : function(){
    shelby.routeHistory = [];
    shelby.iScroll = {
      el : null,
      wrapper : null,
      enabled : false
    };

    this.bind("all", function(route){ shelby.routeHistory.push(route); });
  },

  //---
  //ROUTE HANDLERS
  //---

  openInviteDisplayDashboard : function(params) {
    this.displayDashboard(params, {openInvite: true});
  },

  displayFrameInRollWithComments : function(rollId, frameId, params){
    this.displayFrameInRoll(rollId, frameId, params, {showCommentOverlay:true});
  },

  displayFrameInRoll : function(rollId, frameId, params, options, topLevelViewsOptions){
    // default options
    options = _.chain({}).extend(options).defaults({
      rerollSuccess : (params && params.reroll_success === "true"),
      showCommentOverlay : false
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
    this._fetchViewedVideos();
    this._fetchQueuedVideos();
    // default options
    var defaultOnRollFetch = null;
    if (!shelby.models.guide.get('activeFrameModel')) {
      // if nothing is already playing, start playing the first frame in the roll on load
      defaultOnRollFetch = this._activateFirstRollFrame;
    } else if (shelby.models.routingState.get('forceFramePlay')) {
      defaultOnRollFetch = this._checkPlayRollFrame;
    }

    if (shelby.models.routingState.get('forceFramePlay')) {
      // responded to the forceFramePlay state, so reset it
      shelby.models.routingState.unset('forceFramePlay');
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

  displaySearch : function(params){
    this._fetchViewedVideos();
    this._fetchQueuedVideos();
    this._setupTopLevelViews();
    var query = params && params.query
    if (query) {
      shelby.models.videoSearch.set('query', params.query);
    }
    shelby.models.guide.set({
      displayState : libs.shelbyGT.DisplayState.search
    });
    if (query) {
      shelby.models.videoSearch.trigger('search');
    }
  },

  displayIsolatedRoll : function(rollId, frameId, params){
    // Adjust *how* a few details are displayed via CSS
    $('body').addClass('isolated-roll');

    // Adjust *what* is displayed
    var options = {updateRollTitle:false};

    shelby.views.isoRollAppHeaderView = shelby.views.isoRollAppHeaderView ||
      new libs.shelbyGT.IsoRollAppHeaderView({guide : shelby.models.guide, rollFollowings : shelby.models.rollFollowings});

    if (frameId){
      this.displayFrameInRoll(rollId, frameId, params, options, {isIsolatedRoll : true});
    } else {
      this.displayRoll(rollId, null, null, options, {isIsolatedRoll : true});
    }

    // N.B. We are hiding Frame's tool bar and conversation via CSS.
    // Doing so programatically seemed overly involved and complex when a few CSS rules would do

    //hide the guide initially for iso rolls
    if(shelby.routeHistory.length === 0){
      shelby.models.userDesires.set({guideShown: false});
    }
  },

  displayFacebookGeniusRoll : function(rollId, frameId, params){
    // Adjust *how* a few details are displayed via CSS
    $('body').addClass('facebook-genius');
    // Adjust *what* is displayed
    var options = {updateRollTitle:false};

    if (frameId){
      this.displayFrameInRoll(rollId, frameId, params, options, {isIsolatedRoll : true, isFBGeniusRoll : true});
    } else {
      this.displayRoll(rollId, null, null, options, {isIsolatedRoll : true, isFBGeniusRoll : true});
    }

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
    this._setupTopLevelViews(options);
    this._fetchViewedVideos();
    this._fetchQueuedVideos();
    this._fetchDashboard(options);
  },

  _fetchViewedVideos : function() {
      shelby.models.viewedVideos.fetch();
  },

  _fetchQueuedVideos : function() {
    if (shelby.models.queuedVideos.get('queued_videos').length) return false;
    shelby.models.queuedVideos.fetch();
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

    if (options.displayInGuide) {
      shelby.models.guide.set({
        'displayState' : libs.shelbyGT.DisplayState.dashboard,
        'sinceId' : options.data.since_id ? options.data.since_id : null,
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
      });
    } else {
      shelby.models.dashboard.fetch(fetchOptions);
    }
  },

  displayRollList : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set({displayState:libs.shelbyGT.DisplayState.rollList});
  },

  displayExploreView : function(){
    this._fetchQueuedVideos();
    this._setupTopLevelViews();
    shelby.models.guide.set({displayState:libs.shelbyGT.DisplayState.explore});
    if (shelby.models.exploreRollCategories.get('roll_categories').isEmpty()) {
      shelby.models.exploreGuide.trigger('showSpinner');
    }
    $.when(libs.shelbyGT.RouterUtils.fetchRollCategoriesAndCheckAutoSelect())
      .always(function(){shelby.models.exploreGuide.trigger('hideSpinner');});
  },

  displayOnboardingView : function(stage){
    this._setupTopLevelViews();
    shelby.models.guide.set({displayState:libs.shelbyGT.DisplayState.onboarding, onboardingStage:stage});
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

  displayTools : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set('displayState', libs.shelbyGT.DisplayState.tools);
  },

  displayUserProfile : function(userName, params) {
    this._setupTopLevelViews();
    shelby.models.guide.set('displayState', libs.shelbyGT.DisplayState.userProfile);
    shelby.models.userForProfile.set('nickname', userName);
    shelby.models.userForProfile.fetch();
  },

  doNothing : function(url){
    console.log('unhandled url', url);
  },

  displayRollListAndPlayStream : function(params){
    var self = this;
    this.displayRollList();
    this._fetchViewedVideos();
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
    var rollId = roll.id || roll.get('roll_id');
    this.navigate('roll/' + rollId + (rollTitle ? '/' + libs.utils.String.toUrlSegment(rollTitle) : ''), options);
  },

  _activateFirstRollFrame : function(rollModel, response) {
    // don't want to activate the video if we've switched to explore view during the asynchronous load
    if (shelby.models.guide.get('displayState') != libs.shelbyGT.DisplayState.explore) {
      var firstFrame = rollModel.get('frames').first();
      if (firstFrame) {
        shelby.models.guide.set('activeFrameModel', firstFrame);
      }
    }
  },

  _checkPlayRollFrame : function(rollModel, response) {
    // don't want to activate the video if we've switched to explore view during the asynchronous load
    if (shelby.models.guide.get('displayState') != libs.shelbyGT.DisplayState.explore) {
      var activeFrameModel = shelby.models.guide.get('activeFrameModel');
      if (activeFrameModel) {
        var activeFrameModelRoll = activeFrameModel.get('roll');
        if (activeFrameModelRoll && activeFrameModelRoll.id == rollModel.id) {
          //if the previous active frame was on the current roll, just play it
          shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.playing);
          return;
        }
      }

      //if we weren't already playing something from the current roll, activate the roll's first frame
      var firstFrame = rollModel.get('frames').first();
      if (firstFrame) {
        shelby.models.guide.set('activeFrameModel', firstFrame);
      }
    }
  },

  _activateFrameInRollById : function(rollModel, frameId, showCommentOverlay) {
    // don't want to activate the video if we've switched to explore view during the asynchronous load
    if (shelby.models.guide.get('displayState') != libs.shelbyGT.DisplayState.explore) {
      var frame;
      if (frame = rollModel.get('frames').get(frameId)) {
        var activeFrameModel = shelby.models.guide.get('activeFrameModel');
        if (shelby.models.routingState.get('forceFramePlay')) {
          // if we want to be sure the frame starts playing, we need to take special action if the
          // requested frame is already active, because it may be paused
          if (activeFrameModel && activeFrameModel.id == frame.id) {
            //if the previous active frame was the frame we want to play, play it
            shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.playing);
          } else {
            shelby.models.guide.set('activeFrameModel', frame);
          }
        } else {
          // under normal circumstances we can just set the frame to active because we are not
          // specifically concerned with whether it will play or not, just that it will be
          // selected and displayed
          shelby.models.guide.set('activeFrameModel', frame);
        }
        if (showCommentOverlay) {
          shelby.models.guideOverlay.set({
            activeGuideOverlayType : libs.shelbyGT.GuideOverlayType.conversation,
            activeGuideOverlayFrame : frame
          });
        }
        if (shelby.models.routingState.get('forceFramePlay')) {
          // responded to the forceFramePlay state, so reset it
          shelby.models.routingState.unset('forceFramePlay');
        }
      } else {
        // url frame id doesn't exist in this roll - notify user, then redirect to the default view of the roll
        shelby.alert("Sorry, the video you were looking for doesn't exist in this roll.");
        this.navigateToRoll(rollModel, {trigger:true, replace:true});
      }
    } else {
      if (shelby.models.routingState.get('forceFramePlay')) {
        // responded to the forceFramePlay state, so reset it
        shelby.models.routingState.unset('forceFramePlay');
      }
    }
  },

  _activateFirstDashboardVideoFrame : function(dashboardModel, response) {
    // don't want to activate the video if we've switched to explore view during the asynchronous load
    if (shelby.models.guide.get('displayState') != libs.shelbyGT.DisplayState.explore) {
      var firstDashboardEntry = dashboardModel.get('dashboard_entries').find(function(entry){
        return entry.get('frame') && entry.get('frame').get('video');
      });
      if (firstDashboardEntry) {
        shelby.models.guide.set('activeFrameModel', firstDashboardEntry.get('frame'));
      }
    }
  },

  _activateEntryInDashboardById : function(dashboardModel, entryId) {
    // don't want to activate the video if we've switched to explore view during the asynchronous load
    if (shelby.models.guide.get('displayState') != libs.shelbyGT.DisplayState.explore) {
      var entry;
      if (entry = dashboardModel.get('dashboard_entries').get(entryId)) {
        shelby.models.guide.set('activeFrameModel', entry.get('frame'));
      } else {
        // url entry id doesn't exist in the dashboard - notify user, then redirect to the dashboard
        shelby.alert("Sorry, the entry you were looking for doesn't exist in your stream.");
        this.navigate("/", {trigger:true, replace:true});
      }
    }
  },

  _setupTopLevelViews : function(options){
    // default options
    options = _.chain({}).extend(options).defaults({
      isIsolatedRoll : false,
      isFBGeniusRoll : false,
      openInvite : false
    }).value();

    shelby.models.guide.set('displayIsolatedRoll', options.isIsolatedRoll);
    shelby.models.guide.set('displayFBGeniusRoll', options.isFBGeniusRoll);

    this._setupAnonUserViews(options);
    //--------------------------------------//

    shelby.views.layoutSwitcher = shelby.views.layoutSwitcher ||
        new libs.shelbyGT.LayoutSwitcherView({
          model : shelby.models.guide,
          guideOverlay : shelby.models.guideOverlay,
          userDesires : shelby.models.userDesires
        });
    shelby.views.guideOverlayManager = shelby.views.guideOverlayManager ||
        new libs.shelbyGT.GuideOverlayManagerView({model:shelby.models.guideOverlay, el:'.js-action-layout'});
    shelby.views.guideSpinner =  shelby.views.guideSpinner ||
        new libs.shelbyGT.SpinnerView({el:'#guide', size:'large-light'});
    shelby.views.playlistManager = shelby.views.playlistManager ||
        new libs.shelbyGT.PlaylistManagerView({
          guideModel : shelby.models.guide,
          model : shelby.models.playlistManager
        });

    if(!Browser.isIos()){
      //irrelevant views for iOS devices.
      shelby.views.extensionBannerNotification = shelby.views.extensionBannerNotification ||
        new libs.shelbyGT.ExtensionBannerNotification();

      shelby.views.keyboardControls = shelby.views.keyboardControls ||
          new libs.shelbyGT.KeyboardControlsView();
    }

    if (options.openInvite) {
      shelby.models.invite.trigger('invite:open');
    }

    if (Modernizr && Modernizr.touch) {
    //if Modernizr exists AND determines user is on a touch-device, enable iScroll

      if(!shelby.iScroll.enabled){
        shelby.iScroll.el = new iScroll('js-guide-body');
        shelby.iScroll.wrapper = document.getElementById('guide');
        shelby.iScroll.wrapper.addEventListener("DOMSubtreeModified",function(){
          shelby.iScroll.el.refresh();
        }, false);
        shelby.iScroll.enabled = true;
      }
    }
  },

  _setupAnonUserViews : function(options){
    //this view will not ever render if user is not anonymous
    shelby.views.anonBanner = shelby.views.anonBanner || new libs.shelbyGT.AnonBannerNotificationView();
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
          self._activateFrameInRollById(rollModel, frameId, options.showCommentOverlay);
        }
      }
    }, topLevelViewsOptions);
  }

});
