libs.shelbyGT.DynamicRouter = Backbone.Router.extend({

  routes : {
    "send-invite"                                  : "openInviteDisplayDashboard",
    "isolated-roll/:rollId"                        : "displayIsolatedRoll",
    "isolated-roll/:rollId/frame/:frameId"         : "displayIsolatedRollwithFrame",
    "roll/:rollId/frame/:frameId/comments"         : "displayFrameInRollWithConversationOverlay", // legacy route, let's kill it if we can
    "roll/:rollId/frame/:frameId/:showOverlayType" : "displayFrameInRollAndShowOverlay",
    "roll/:rollId/frame/:frameId"                  : "displayFrameInRoll",
    "roll/:rollId/:title"                          : "displayRoll",
    "roll/:rollId"                                 : "displayRoll",
    "rollFromFrame/:frameId"                       : "displayRollFromFrame",
    "embed/:frameId"                               : "displayEmbeddedFrame",
    "user/:id/personal_roll"                       : "displayUserPersonalRoll",
    "community"                                    : "displayCommunityChannel",
    "channels"                                     : "displayChannel",
    "channels/:channel"                            : "displayChannel",
    "channels/:channel/:entryId"                   : "displayEntryInDashboard",
    "help"                                         : "displayHelp",
    "legal"                                        : "displayLegal",
    "search"                                       : "displaySearch",
    "following"                                    : "displayRollList",
    "onboarding/:stage"                            : "displayOnboardingView",
    "preferences"                                  : "displayUserPreferences",
    "likes"                                        : "displaySaves",
    "saves"                                        : "displaySaves",
    "stream"                                       : "displayDashboard",
    "tools"                                        : "displayTools",
    ""                                             : "displayDashboard",
    ":userName"                                    : "displayUserProfile",
    ":userName/shares"                             : "displayUserProfile",
    ":userName/shares/:frameId"                    : "displayFrameInUserProfile",
    "*url"                                         : "doNothing"
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

  displayFrameInRollWithConversationOverlay : function(rollId, frameId, params){
    this.displayFrameInRollAndShowOverlay(rollId, frameId, libs.shelbyGT.GuideOverlayType.conversation, params);
  },

  displayFrameInRollAndShowOverlay : function(rollId, frameId, showOverlayType, params){
    // make sure this is a type of overlay we support displaying on page load via the router
    if (showOverlayType == libs.shelbyGT.GuideOverlayType.conversation || showOverlayType == libs.shelbyGT.GuideOverlayType.rolling) {
      this.displayFrameInRoll(rollId, frameId, params, {showOverlayType: showOverlayType});
    } else {
      // if not supported, don't pass the overlay parameter on, and take the overlay type segment off the end of the url
      shelby.router.navigate('roll/' + rollId + '/frame/' + frameId, {trigger: false, replace: true});
      this.displayFrameInRoll(rollId, frameId, params);
    }
  },

  displayFrameInRoll : function(rollId, frameId, params, options, topLevelViewsOptions){
    // default options
    options = _.chain({}).extend(options).defaults({
      rerollSuccess : (params && params.reroll_success === "true"),
      showOverlayType : null
    }).value();

    var self = this;
    // if there are params that specify this was a roll invite...
    //  make the call to add the user to the roll...
    //  then show them the roll
    // otherwise just show the roll view
    if (!shelby.models.user.isAnonymous() && params && params.gt_ref_roll){
      var rollToJoin = new libs.shelbyGT.RollModel({id:params.gt_ref_roll});
      rollToJoin.joinRoll(function(){
        self._setupRollViewWithCallback(rollId, frameId, options, topLevelViewsOptions);
      });
    } else {
      self._setupRollViewWithCallback(rollId, frameId, options, topLevelViewsOptions);
    }
  },

  displayRoll : function(roll, title, params, options, topLevelViewsOptions){
    // default options
    var defaultOnRollFetch = null;
    if (!shelby.models.guide.get('activeFrameModel')) {
      // if nothing is already playing, start playing the first frame in the roll on load
      defaultOnRollFetch = this._activateFirstRollFrame;
    } else if (shelby.models.routingState.get('forceFramePlay')) {
      defaultOnRollFetch = this._checkPlayRollFrame;
    }

    options = _.chain({}).extend(options).defaults({
      updateRollTitle: true,
      onRollFetch: defaultOnRollFetch,
      data: {include_children:true}
    }).value();

    var rollId;
    if (typeof(roll) === 'string') {
      rollId = roll;
    } else {
      // if roll is a Model, get its id
      rollId = roll.id;
    }
    if (options.updateRollTitle && rollId == shelby.models.user.get('personal_roll_id')) {
      // we've got a special route to display if this roll is the personal roll
      // of the currently logged in user
      this.navigate(shelby.models.user.get('nickname'), {trigger: false, replace: true});
    }

    this._fetchViewedVideos();
    this._fetchQueuedVideos();

    this._setupRollView(roll, title, {
      updateRollTitle: options.updateRollTitle,
      data: options.data,
      onRollFetch: options.onRollFetch
    }, topLevelViewsOptions);

    if (shelby.models.routingState.get('forceFramePlay')) {
      // responded to the forceFramePlay state, so reset it
      shelby.models.routingState.unset('forceFramePlay');
    }
  },

  displaySearch : function(params){
    this._fetchViewedVideos();
    this._fetchQueuedVideos();
    this._setupTopLevelViews();

    var query = params && (params.query || params.q);
    if (query) {
      shelby.models.videoSearch.set('query', (params.query || params.q));
    }
    shelby.models.guide.set({
      displayState : libs.shelbyGT.DisplayState.search
    });
    if (query) {
      shelby.models.videoSearch.trigger('search');
    }
    else {
      shelby.views.searchWelcome = shelby.views.searchWelcome ||
          new libs.shelbyGT.searchWelcome({
            el : '.js-search-welcome',
            searchWelcomeModel : shelby.models.dotTvWelcome
          });

      // this should only be shown the first visit which we can track via a cookie
      if (cookies.get('search-welcome') != "1") {
        shelby.models.playbackState.set('autoplayOnVideoDisplay', false);
        shelby.userInactivity.disableUserActivityDetection();
        $('#js-welcome, .js-search-welcome').toggleClass('hidden', false);
      }
      else {
        $('#js-welcome, .js-search-welcome').toggleClass('hidden', true);
      }
    }

    // send page view to GA
    if(shelby.routeHistory.length !== 0){
      try {
        _gaq.push(['_trackPageview', '/search']);
      } catch(e) {}
    }
  },

  displayIsolatedRoll : function(rollId, params){
    this._setupDotTvUserProfileView({
      rollId : rollId
    }, params);
  },

  displayIsolatedRollwithFrame : function(rollId, frameId, params) {
    this._setupDotTvUserProfileView({
      frameId : frameId,
      rollId : rollId
    }, params);
  },

  _prepIsolatedRoll : function(opts) {
    // Adjust *how* a few details are displayed via CSS
    $('body').addClass('isolated-roll');
    $('body').addClass('js-isolated-roll');

    // save current referrer host name in shelby config
    if (opts.params && opts.params.src){ shelby.config.hostName = opts.params.src; }

    shelby.views.isoRollAppHeaderView = shelby.views.isoRollAppHeaderView ||
      new libs.shelbyGT.IsoRollAppHeaderView({guide : shelby.models.guide, rollFollowings : shelby.models.rollFollowings});

    var options = {updateRollTitle:false};
    var topLevelViewsOptions = {isIsolatedRoll : true, hostName: shelby.config.hostName};

    if (opts.frameId){
      this.displayFrameInRoll(opts.rollId, opts.frameId, opts.params, options, topLevelViewsOptions);
    }
    else {
      this.displayRoll(opts.rollId, null, null, options, topLevelViewsOptions);
    }
    // N.B. We are hiding Frame's tool bar and conversation via CSS.
    // Doing so programatically seemed overly involved and complex when a few CSS rules would do

    //show the guide initially for iso rolls
    if(shelby.routeHistory.length === 0){
      shelby.models.userDesires.set({guideShown: true});
    }
  },

  // currently not in use but may become useful again
  _displayRandomChannel : function(params) {
    var channelKeys = _.keys(shelby.config.channelsForNav);
    var randomChannelKey = channelKeys[_.random(channelKeys.length - 1)];
    this.navigate('channels/' + randomChannelKey, {trigger: false, replace: true});
    this.displayChannel(randomChannelKey, params);
  },

  displayCommunityChannel : function(params){
    this.displayChannel('community', params);
  },

  displayChannel : function(channel, params){
    if (channel == 'community') {
      this.displayDashboard(params, {channel: channel});
      this.navigate('community', {trigger: false, replace: true});
    } else {
      // if the requested channel doesn't exist, just go to the first channel
      this.navigate('community', {trigger: true, replace: true});
    }

    this._doChannelTracking(channel, params);

  },

  displayEntryInDashboard : function(channel, entryId, params){
    var self = this;
    if (_(shelby.config.channels).has(channel)) {
      this.displayDashboard(params, {
        channel: channel,
        data: {
          since_id : entryId,
          include_children : true
        },
        onDashboardFetch: function(dashboardModel, response){
          self._activateEntryInDashboardById(dashboardModel, entryId);
        }
      });
    } else {
      // if the requested channel doesn't exist, just go to the first channel
      this.navigate('channels/community/' + entryId, {trigger: true, replace: true});
    }

    this._doChannelTracking(channel);

  },

  _doChannelTracking : function(channel, params) {
    // track page view
    if (params && params.src == "chrome-channels-app"){
      shelby.trackEx({
        providers : ['ga', 'kmq'],
        gaCategory : "#Channels Chrome App",
        gaAction : 'Loaded',
        gaLabel : shelby.models.user.get('nickname'),
        kmqName : "Loaded #Channels Chrome App",
        kmqProperties : { channel : channel }
      });
      try {
        _gaq.push(['_trackPageview', '/channels?src='+params.src]);
      } catch(e) {}
    }

    // send page view to GA
    if(shelby.routeHistory.length !== 0){
      try {
        _gaq.push(['_trackPageview', '/channels/'+channel]);
      } catch(e) {}
    }
    shelby.trackEx({
      providers : ['kmq'],
      kmqName : "Visit Channel",
      kmqProperties: {'Channel' : channel}
    });
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

  displayEmbeddedFrame : function(frameId, params){
    //frame (with children) is already on the page
    var frame = new libs.shelbyGT.FrameModel(shelby.embedBootstrapModels.frame);

    if (!shelby.config.socialLibsLoaded) {
      $(document).ready(function(){
        $('body').append(SHELBYJST['social-libs']());
      });
      shelby.config.socialLibsLoaded = true;
    }

    shelby.views.embeddedFrame = shelby.views.embeddedFrame ||
      new libs.shelbyGT.EmbeddedFrameView({
        el : "#embedded-view",
        model: frame,
        guide : shelby.models.guide,
        playbackState : shelby.models.playbackState
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

  displayFrameInUserPersonalRoll : function(userId, frameId, params){
    var self = this;
    var roll = new libs.shelbyGT.UserPersonalRollModel({creator_id:userId});
    //we don't have enough information about the roll to proceed, so we have to do a preliminary fetch of
    //the roll info before we can continue
    roll.fetchWithoutFrames({
      success : function() {
        self.displayFrameInRoll(roll.id, frameId, params);
      }
    });
  },

  displayDashboard : function(params, options){
    this._setupTopLevelViews(options);
    this._fetchViewedVideos();
    this._fetchQueuedVideos();
    this._fetchDashboard(options);

    //event tracking
    var _action = shelby.models.user.isAnonymous() ? 'Load stream in app signed out' : 'Load stream in app signed in';
    shelby.trackEx({
      providers : ['ga', 'kmq'],
      gaCategory : "App",
      gaAction : _action,
      gaLabel : shelby.models.user.get('nickname'),
      kmqProperties : { user : shelby.models.user.get('nickname') }
    });
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
      // if nothing is already playing,
      // start playing the first frame in the dashboard on load
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
      channel : null,
      data: {
          include_children : true
      },
      displayInGuide : true
    }).value();

    if (options.channel) {
      // if we're loading another user's dashboard or 'channel', use the user/id/dashboard api route
      shelby.models.dashboard.set('channel', options.channel);
    } else {
      shelby.models.dashboard.unset('channel');
    }

    var fetchOptions = {data: options.data};
    fetchOptions.data.limit = shelby.config.pageLoadSizes.dashboard;
    fetchOptions.success = options.onDashboardFetch;
    // uncomment to emulate a new user sign-up w/ no data
    // fetchOptions.data.limit = Math.random() < 0.6 ? 20 : 0;

    if (options.displayInGuide) {
      var displayState = options.channel ? libs.shelbyGT.DisplayState.channel : libs.shelbyGT.DisplayState.dashboard;
      var channel = options.channel;

      shelby.models.guide.set({
        'displayState' : displayState,
        'currentChannelId' : channel,
        'sinceId' : options.data.since_id ? options.data.since_id : null
      });

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
    // send page view to GA
      if(shelby.routeHistory.length !== 0){
        try {
          _gaq.push(['_trackPageview', '/following']);
        } catch(e) {}
      }
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
      }, {
        isIsolatedRoll : false
      });
      // send page view to GA
      if(shelby.routeHistory.length !== 0){
        try {
          _gaq.push(['_trackPageview', '/likes']);
        } catch(e) {}
      }
    } else {
      shelby.alert({message: "<p>Could not roll view to your Queue</p>"});
      this.navigate('', {trigger:true, replace:true});
    }
  },

  displayUserPreferences : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set('displayState', libs.shelbyGT.DisplayState.userPreferences);
    // send page view to GA
    if(shelby.routeHistory.length !== 0){
      try {
        _gaq.push(['_trackPageview', '/preferences']);
      } catch(e) {}
    }
  },

  displayHelp : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set('displayState', libs.shelbyGT.DisplayState.help);
  },

  displayLegal : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set('displayState', libs.shelbyGT.DisplayState.legal);
  },

  displayTools : function(){
    this._setupTopLevelViews();
    shelby.models.guide.set('displayState', libs.shelbyGT.DisplayState.tools);

    // send page view to GA
    try { _gaq.push(['_trackPageview', '/tools']); } catch(e) {}
  },

  displayUserProfile : function(userName, params) {
    if (userName == shelby.models.user.get('nickname')) {
      this.displayRoll(shelby.models.user.get('personal_roll_id'), null, params, {updateRollTitle: false});
    } else {
      this.displayUserPersonalRoll(userName, params);
    }
  },

  displayFrameInUserProfile : function(userName, frameId, params) {
    this.displayFrameInUserPersonalRoll(userName, frameId, params);
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
    shelby.models.playlistManager.trigger('playlist:start');
  },

  _checkPlayRollFrame : function(rollModel, response) {
    var activeFrameModel = shelby.models.guide.get('activeFrameModel');
    // for compatibility reasons, we only show videos from certain providers on mobile
    if (activeFrameModel && (!Browser.isMobile() || activeFrameModel.get('video').canPlayMobile())) {
      var activeFrameModelRoll = activeFrameModel.get('roll');
      if (activeFrameModelRoll && activeFrameModelRoll.id == rollModel.id) {
        //if the previous active frame was on the current roll, just play it
        shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.playing);
        return;
      }
    }

    //if we weren't already playing something from the current roll, activate the roll's first frame
    shelby.models.playlistManager.trigger('playlist:start');
  },

  _activateFrameInRollById : function(rollModel, frameId, showOverlayType) {
    var frame = shelby.models.playlistManager.get('playlistFrameGroupCollection').getFrameById(frameId);
    // for compatibility reasons, we only show videos from certain providers on mobile
    if (frame && (!Browser.isMobile() || frame.get('video').canPlayMobile())) {
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
      if (shelby.models.routingState.get('forceFramePlay')) {
        // responded to the forceFramePlay state, so reset it
        shelby.models.routingState.unset('forceFramePlay');
      }
      // if we got a valid frame and the parameters request showing an overlay for this
      // frame, show that overlay
      // NOTE: validity of the overlay type has been checked earlier so here we just assume it's
      // a type of overlay we support
      if (showOverlayType) {
        shelby.models.guideOverlay.switchOrHideOverlay(showOverlayType, frame);
      }
    } else {
      // url frame id doesn't exist in this roll - notify user, then redirect to the default view of the roll
      shelby.alert({message: "Sorry, the video you were looking for doesn't exist in this roll."});
      this.navigateToRoll(rollModel, {trigger:true, replace:true});
    }
  },

  _activateFirstDashboardVideoFrame : function(dashboardModel, response) {
    shelby.models.playlistManager.trigger('playlist:start');
  },

  _activateEntryInDashboardById : function(dashboardModel, entryId) {
      var frameActivated = false;
      var dbEntry = Backbone.Relational.store.find(libs.shelbyGT.DashboardEntryModel, entryId);
      if (dbEntry && dbEntry.has('frame')) {
        var frame = shelby.models.playlistManager.get('playlistFrameGroupCollection').getFrameById(dbEntry.get('frame').id);
        // for compatibility reasons, we only show videos from certain providers on mobile
        if (frame && (!Browser.isMobile() || frame.get('video').canPlayMobile())) {
          shelby.models.guide.set('activeFrameModel', frame);
          frameActivated = true;
        }
      }

      if (!frameActivated) {
        // url entry id doesn't exist in the dashboard
        if (dashboardModel.has('channel')) {
          // they were looking for a video on a channel - notify user, then redirect to the beginning of the channel
          shelby.alert({message: "<p>Sorry, the video you were looking for doesn't exist in this channel.</p>"});
          this.navigate("channels/" + dashboardModel.get('channel'), {trigger:true, replace:true});
        } else {
          // they were looking for a video in their own stream - notify user, then redirect to the beginning of the stream
          shelby.alert({message: "<p>Sorry, the video you were looking for doesn't exist.</p>"});
          this.navigate("", {trigger:true, replace:true});
        }
      }

  },

  _setupTopLevelViews : function(options){
    // default options
    options = _.chain({}).extend(options).defaults({
      isIsolatedRoll : false,
      openInvite : false
    }).value();

    shelby.models.guide.set('displayIsolatedRoll', options.isIsolatedRoll);
    shelby.models.guide.set('hostName', options.hostName);

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
      ///////////////////
      // Not sure if this fits with current strategy, commenting out for now.
      // if( !shelby.models.user.isAnonymous() ) {
      //   shelby.views.extensionBannerNotification = shelby.views.extensionBannerNotification ||
      //     new libs.shelbyGT.ExtensionBannerNotification({
      //       guideModel : shelby.models.guide
      //     });
      // }

      shelby.views.keyboardControls = shelby.views.keyboardControls ||
          new libs.shelbyGT.KeyboardControlsView();
    }

    shelby.views.appWelcome = shelby.views.appWelcome ||
      new libs.shelbyGT.welcomeMessages({
        el : '.js-app-welcome'
      });

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
    // default options
    options = _.chain({}).extend(options).defaults({
      updateRollTitle: false,
      onRollFetch: null,
      data: null
    }).value();

    topLevelViewsOptions = _.chain({}).extend(topLevelViewsOptions).defaults({
      isIsolatedRoll: false
    }).value();

    this._setupTopLevelViews(topLevelViewsOptions);

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
        rollModel.unbind('change:title');
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

    // show dot-tv-welcome-message if on an isolated roll
    // unless we've already done so
    if (topLevelViewsOptions.isIsolatedRoll && !shelby.views.dotTVWelcome){
      // don't auto play the video - the user will have to click on the
      // dot tv welcome banner to start playback
      shelby.models.playbackState.set('autoplayOnVideoDisplay', false);
      shelby.views.dotTVWelcome = new libs.shelbyGT.dotTVWelcome({
        el : '.js-isolated-roll-welcome',
        model : rollModel,
        dotTvWelcomeModel : shelby.models.dotTvWelcome
      });
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
          self._activateFrameInRollById(rollModel, frameId, options.showOverlayType);
        }
      }
    }, topLevelViewsOptions);
  },

  _setupDotTvUserProfileView : function(options, params){
    var self = this;

    // default options
    options = _.chain({}).extend(options).defaults({
      frameId: null,
      rollId: null,
      userName: null
    }).value();

    // save current referrer host name in shelby config
    if (params && params.src) {
      shelby.config.hostName = params.src;
    }

    if (!shelby.config.socialLibsLoaded) {
      $(document).ready(function(){
        $('body').append(SHELBYJST['social-libs']());
      });
      shelby.config.socialLibsLoaded = true;
    }

    this._fetchViewedVideos();
    this._fetchQueuedVideos();
    this._setupTopLevelViews({isIsolatedRoll: true});
    shelby.models.guide.set('displayState', libs.shelbyGT.DisplayState.dotTv);
    // if a specific roll and frame has been requested we need to pass the information on to the
    // user profile view so that it can load up the right frame
    shelby.models.userProfile.set({
      autoLoadFrameId : options.frameId,
      autoLoadRollId : options.rollId
    });
    var dotTvLanding = !shelby.views.dotTVWelcome;
    // only show the .tv welcome banner once
    if (dotTvLanding) {
      // don't auto play the video - the user will have to click on the
      // dot tv welcome banner to start playback
      shelby.models.playbackState.set('autoplayOnVideoDisplay', false);
    }

    if (options.userName) {
      // if the route parameters included the user name we have everything we need to proceed
      // and fetch that user's info, but we'll wait until we have the user's roll info
      // to show the .tv welcome banner
      this._getUserByNicknameThenAssociatedRolls({
        doShowWelcomeBanner : dotTvLanding,
        userNickname : options.userName
      });
    } else {
      var roll = libs.shelbyGT.RollModel.findOrCreate({id: options.rollId});
      if (dotTvLanding) {
        // we have the roll id and the dot tv welcome banner keys off of the roll,
        // so we can create it now
        shelby.views.dotTVWelcome = new libs.shelbyGT.dotTVWelcome({
          el : '.js-isolated-roll-welcome--dot-tv',
          model : roll,
          dotTvWelcomeModel : shelby.models.dotTvWelcome
        });
      }
      // if the route params only included a roll id (for an isolated roll), we need
      // to get the nickname of the user who created that roll
      if (roll.has('creator_nickname')) {
        // if we already have the roll info, we can just get the creator nickname and load
        // the user info based on that
        this._getUserByNicknameThenAssociatedRolls({userNickname: roll.get('creator_nickname')});
      } else {
        // if we don't have the roll info, fetch the roll and then use the creator nickname from
        // the fetched data to fetch the info for that creating user
        roll.fetch({
          url : shelby.config.apiRoot + '/roll/' + roll.id,
          success : function(rollModel, response){
            self._getUserByNicknameThenAssociatedRolls({userNickname: rollModel.get('creator_nickname')});
          }
        });
      }
    }
  },

  _getUserByNicknameThenAssociatedRolls : function(options){
    // default options
    options = _.chain({}).extend(options).defaults({
      doShowWelcomeBanner: false,
      frameId: null,
      userNickname: null
    }).value();


    var userForProfile = shelby.models.userProfile.get('currentUser');
    if (!userForProfile || userForProfile.get('nickname') != options.userNickname) {
      userForProfile = new libs.shelbyGT.UserModel({nickname: options.userNickname});
      shelby.models.userProfile.set('currentUser', userForProfile);
      // we're completely switching users so we need to get rid of the old user's
      // rolls in preparation for getting the new user's
      shelby.models.userOwnedRolls.get('rolls').reset();
    }
    if (userForProfile.isNew()) {
      // if we don't have the user info yet, we need to fetch it, then use the user's personal roll id
      // to fetch their associated rolls
      userForProfile.fetch({success: function(userModel, response){
        var userPersonalRollId = userForProfile.get('personal_roll_id');
        // we now have the user's personal roll, so we create the .tv welcome banner if requested
        if (options.doShowWelcomeBanner) {
          var roll = libs.shelbyGT.RollModel.findOrCreate({id: userPersonalRollId});
          shelby.views.dotTVWelcome = new libs.shelbyGT.dotTVWelcome({
            model : roll,
            dotTvWelcomeModel : shelby.models.dotTvWelcome,
            el : '.js-isolated-roll-welcome--dot-tv'
          });
        }
        shelby.models.userOwnedRolls.fetch({
          url: shelby.config.apiRoot + '/roll/' + userPersonalRollId + '/associated'
        });
      }});
    } else {
      // if we already have the user info, we know their personal roll id, so just fetch their
      // associated rolls, and optionally create the .tv welcome banner, immediately
      var userPersonalRollId = userForProfile.get('personal_roll_id');
      if (options.doShowWelcomeBanner) {
        var roll = libs.shelbyGT.RollModel.findOrCreate({id: userPersonalRollId});
        shelby.views.dotTVWelcome = new libs.shelbyGT.dotTVWelcome({
          model : roll,
          dotTvWelcomeModel : shelby.models.dotTvWelcome,
          el : '.js-isolated-roll-welcome--dot-tv'
        });
      }
      shelby.models.userOwnedRolls.fetch({
          url: shelby.config.apiRoot + '/roll/' + userPersonalRollId + '/associated'
      });
    }
  }

});
