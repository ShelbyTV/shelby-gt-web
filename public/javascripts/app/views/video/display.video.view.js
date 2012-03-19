//handle the showing and playback of videos
// does a bit of the job of a controller w/r/t individual playback managers

//Events bound (public):
//  playback:restart
//  playback:playpause
//  playback:pause
//  playback:play
//  playback:toggleMute
//  playback:seekByPct
//  video:ended (and emits playback:autoadvance for ChannelsRouter)
//
//Events triggered:
//

window.libs.shelbyGT.VideoDisplayView = Backbone.View.extend({

  //which specific PlaybackManager is currently handling playback (YouTube, Vimeo, Brightcove, etc...)
  _currentPlaybackManager: null,

  //when in iFrame, we don't want autoplay on the very first video (and only that video)
  _hasPlayed: false,

  _vid_tracking_start_time: 6,

  el: '#video',

  initialize: function(){
    var self = this;

    //--------------------set up players
    this._playbackManagers = {
      youtube : new YouTubeHTML5PlaybackManager({ divId: "youtube-player-holder", playbackState: shelby.models.playbackState }),
      vimeo : new VimeoPlaybackManager({ divId: "vimeo-player-holder", playbackState: shelby.models.playbackState }),
      dailymotion : new DailyMotionPlaybackManager({ divId: "dailymotion-player-holder", playbackState: shelby.models.playbackState }),
      'blip.tv' : new BliptvPlaybackManager({ divId: "bliptv-player-holder", playbackState: shelby.models.playbackState }),
      ooyala : new OoyalaPlaybackManager({ divId: "ooyala-player-holder", playbackState: shelby.models.playbackState }),
      'college humor' : new CollegehumorPlaybackManager({ divId: "collegehumor-player-holder", playbackState: shelby.models.playbackState }),
      hulu : new HuluPlaybackManager({ divId: "hulu-player-holder", playbackState: shelby.models.playbackState })
    };

    this.model.bind('change:activeFrameModel', this._displayVideo, this);
    // //---------------------listen to public events
    // Backbone.Events.bind("playback:restart", function() { self.render(); });
    // Backbone.Events.bind("playback:playpause", function() { self.playPause(); });
    // Backbone.Events.bind("playback:play", function() { self._play(); });
    // Backbone.Events.bind("playback:pause", function() { self._pause(); });
    // Backbone.Events.bind("video:ended", function() { self._videoEnded(); });
    // Backbone.Events.bind("video:progress", function(percent) { self._recordBroadcastProgress(percent); });
    // Backbone.Events.bind("playback:toggleMute", function() { self._toggleMute(); });
    // Backbone.Events.bind("playback:seekByPct", function(pct) { self._seekByPct(pct); });
    // Backbone.Events.bind("playback:error", function(options) { self._handlePlaybackError(options); });
    // Backbone.Events.bind("iframe:renderOptions", function(options) {self._renderIframeOptions(options); });
    // Backbone.Events.bind("ios:enterFullscreen", function() { self._iosEnterFullscreen(); });
    // Backbone.Events.bind("ios:exitFullscreen", function() { self._iosExitFullscreen(); });
    //
    // //Check for existence of iFrame
    // if (Browser.isIframe()){
    //  window.addEventListener("message", function(event){
    //    event = event.data;
    //    switch (event){
    //      case 'iframe:toggleplay':
    //        self.playPause();
    //        break;
    //      case 'iframe:togglemute':
    //        self._toggleMute();
    //        break;
    //      //hey fucker, don't post to parent in a default case.  Unless you want to drop an infinite loop on some unsuspecting dev down the road ;-]
    //    }
    //  },
    //  false);
    // }

    //this.render(); render is now an event handler
  },

  // self.render(); ? ? ? ? ?

  _iframeRenderMap : {
    sidebar: function(val){
      if (val){
        Backbone.Events.trigger("guide:show");
      } else {
        Backbone.Events.trigger("guide:hide");
      }
    }
  },

  _renderIframeOptions : function(options){
    var self = this;
    Object.keys(options).forEach(function(k){
      if (self._iframeRenderMap.hasOwnProperty(k)){
        self._iframeRenderMap[k](options[k]);
      }
    });
  },

  _displayVideo: function(guideModel, frame){
    var self = this;

    /* Clear Timer set to track broadcast was played in case it was set already */
    // clearTimeout(App._trackingTimer);

    //find next player
    var video = frame.get('video');

    var nextPlaybackManager = this._playbackManagers[video.get('provider_name')];

    //swap to new player only when necessary
    if (nextPlaybackManager){
      if (nextPlaybackManager != this._currentPlaybackManager ){
        if( this._currentPlaybackManager) {
          //stop playing & loading of current video
          this._currentPlaybackManager.stop();
          this._currentPlaybackManager.hide();
          this._currentPlaybackManager.swapOutPlayer();
          this._currentPlaybackManager._playbackState.setPlayerLoaded(false);
        }
        this._currentPlaybackManager = nextPlaybackManager;
        this._currentPlaybackManager.swapInPlayer();
        this._currentPlaybackManager.show();
      }

      //if we haven't played anything, and are in anIframe, don't autoplay (and make sure playback state is correct)
      var shouldAutoplay = !(Browser.isIframe() && !this._hasPlayed && !Browser.isFacebook());
      this._currentPlaybackManager._playbackState.setPlayable(true);
      this._currentPlaybackManager.playVideo(video, shouldAutoplay );

      if( !shouldAutoplay ){
        shelby.models.playbackState.setPlaying(false);
        shelby.models.playbackState.setUserPaused(true);

        // showing a loading indicator until player is loaded
        $("#paused-pane-wrapper").show().addClass('iframe-loading');

        var loadingTimer = setInterval(function(){
          if (self._playbackState.isPlayerLoaded()){
            $("#paused-pane-wrapper").addClass('iframe-loading-done');
            $("#paused-pane-wrapper").removeClass('iframe-loading iframe-loading-done');
            clearInterval(loadingTimer);
          }
        }, 100);

      }
    }

    // Event/Data Tracking
    // App._trackingTimer = setTimeout(function(){ self._recordBroadcastPlay(currentBcast);}, self._vid_tracking_start_time*1000);        

    this._hasPlayed = true;

  },

  //-------------------------------------------
  // Playback
  //------------------------------------------

  playPause: function(){
    if( this._currentPlaybackManager ){ 
      this._currentPlaybackManager.playPause();
    }
  },

  _play: function(){
    if( this._currentPlaybackManager ){ 
      this._currentPlaybackManager.play();
    }
  },

  _pause: function(){
    if( this._currentPlaybackManager ){ 
      this._currentPlaybackManager.pause();
    }
  },

  _videoEnded: function(){
    this._recordBroadcastEnded(this.model.getCurrentBroadcast(), this.getCurrentPlaybackTime());
    Backbone.Events.trigger("playback:autoadvance");
  },

  _toggleMute: function(){
    if( this._currentPlaybackManager ){
      this._currentPlaybackManager.toggleMute();
    }
  },

  _seekByPct: function(pct){
    if( this._currentPlaybackManager ){
      this._currentPlaybackManager.seekByPct(pct);
    }
  },

  _handlePlaybackError: function(options){
    if (typeof(options) === 'undefined') { options = {}; }
    if (typeof(options.persist) === 'undefined') { options.persist = true; }
    var playable = typeof options.playable == 'undefined' ? false : options.playable;
    var msg = options.msg;
    var persist = options.persist;

    shelby.models.playbackState.setPlayable(playable);
    shelby.models.playbackState.setUserPaused(false);
    var currentBcast= this.model.getCurrentBroadcast();

    /* decide whether to save playability state or not */
    if (options.persist) { currentBcast.save({playable: playable}); }
  },

  //-------------------------------------------
  // Data tracking
  //------------------------------------------

  _recordBroadcastPlay: function(broadcast){
    if( broadcast != null ){
      /* write to shelby db */
      if( broadcast.get('user_id') == App.getCurrentUser().id ){
        broadcast.save({watched_by_owner: true});
      }
      /* record to g. analytics */
      App.trackEvent('auto/play/0:00/', broadcast.id, App.getCurrentUser().get('nickname'));
    }
  },

  _recordBroadcastProgress: function(progress){
    broadcast = this.model.getCurrentBroadcast();
    if( broadcast != null ){
      App.trackEvent('auto/'+progress+'%', broadcast.id, App.getCurrentUser().get('nickname'));
      if ( broadcast.get('user_id') == App.getCurrentUser().id && App.getCurrentUser().get('preferences').quiet_mode === false){
        /* post this in the fb og  */
        $.get('/fb/og/' + broadcast.id + '/watching');
      }
    }
  },

  _recordBroadcastEnded: function(broadcast, video_t){
    if( broadcast != null ){
      App.trackEvent('auto/end', broadcast.id, App.getCurrentUser().get('nickname'));
    }
  },

  //-------------------------------------------
  // iOS display helpers
  //------------------------------------------

  _iosEnterFullscreen: function(){
    //TODO: when youtube (or whatever players we support) provide this functionality, hit it
  },

  _iosExitFullscreen: function(){ 
    //TODO: when youtube (or whatever players we support) provide this functionality, hit it
  },

  //-------------------------------------------
  // Helpers
  //------------------------------------------

  getCurrentPlaybackTime: function(){
    if( this._currentPlaybackManager != null ){
      return this._currentPlaybackManager.getCurrentTime();
    } else {
      return "?:?";
    }
  },

  getCurrentPlaybackPercent: function(){
    if( this._currentPlaybackManager != null && this._currentPlaybackManager._currentBroadcast.get('duration') !== 0){
      return parseFloat((this._currentPlaybackManager.getCurrentTime() / this._currentPlaybackManager._currentBroadcast.get('duration') * 100).toFixed(2));
    } else {
      return "?%";
    }
  }

});
