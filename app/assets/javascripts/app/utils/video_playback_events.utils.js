/*
*  Sends events about video playback to the API.  Currently only cares about "watched" event.
*/
(function(){
  libs.utils.VideoPlaybackEvents = {
    _playbackState : null,
    _guideModel : null,
    _userDesires : null,

    _currentFrame : null,
    _startTime : 0,
    _currentPlayerInfo : null,

    _userSeeked : false,

    //how much playback (in seconds) must occur before we mark the video started
    //NB: this should always be less than WATCHED_INTERVAL
    START_INTERVAL : 5,
    //how much playback (in seconds) should each "watched" interval represent
    WATCHED_INTERVAL : 15,
    //how much playback (by percent) should each "watched" interval represent
    WATCHED_PCT : 0.20,
    //when to mark video as watched (by percent) for js based even tracking
    EVENT_TRACKING_PCT_THRESHOLD : 0.10,
    // when to message a user about liking/sharing/rolling
    ENGAGED_INTERVAL : 60,
    ENGAGED_WATCHER_PCT : 0.40,
    ENGAGED_WATCHER_PCT_THRESHOLD : 40,

    _markedAsStarted : null,
    _markedAsWatched : null,
    _markedAsEngaged : null,

    initialize: function(playbackState, guideModel, userDesires) {
      this._playbackState = playbackState;
      this._guideModel = guideModel;
      this._userDesires = userDesires;

      //track the active frame via guideModel
      this._guideModel.bind('change:activeFrameModel', this._frameChanged, this);

      //and track the progress of the video via player & playback state
      this._playbackState.bind('change:activePlayerState', this._onNewPlayerState, this);
      if( this._playbackState.get('activePlayerState') !== null ) {
        this._onNewPlayerState(this._playbackState, this._playbackState.get('activePlayerState'));
      }

      this._userDesires.bind('change:currentTimePct', this._seekByPct, this);
    },

    //--------------------------------------
    // The real work
    //--------------------------------------

    getCurrentPlayerInfo : function(){
      return this._currentPlayerInfo;
    },

    /*
    * If the user watches WATCHED_INTERVAL seconds or WATHCHED_PCT % of the video, count that as a watch
    */
    _onCurrentTimeChange: function(attr, curTime){

      if( this._userSeeked ) {
        // user seeked, we will reset _startTime on the next update
        this._userSeeked = false;
        this._startTime = null;
        return;
      }

      if( this._startTime === null || this._startTime === undefined ){
        //resetting _startTime after user seek
        this._startTime = curTime;
        return;
      }

      //can't do any calculations w/o curTime
      if(!curTime) return;

      // did they watch the mininum amount in seconds or by percentage?
      var watchedSeconds = curTime - this._startTime;
      if( watchedSeconds > this.WATCHED_INTERVAL || watchedSeconds > this._requiredWatchSecondsByPct) {
        //API intelligently handles multiple "watched" posts for same frame
        this._currentFrame.watched(false, this._startTime, curTime);
        this._startTime = curTime;

        this.trackWatchProgress(watchedSeconds);

        // If this hasn't been already marked as watched (in the eyes of ourevent tracking), do so.
        if (!this._markedAsWatched) {this.trackWatchedEvent(curTime);}
      }
      // new Watch events are based off of interval seconds only, not percentages
      if (watchedSeconds > this.START_INTERVAL && !this._markedAsStarted) {
          this.trackWatchStart();
          this._markedAsStarted = true;
      }


      // wait till a video has a duration then trigger a hook
      if (!this._markedAsEngaged && this._currentFrame.get('video').get('duration')) {
        this._requiredEngagedSecondsByPct = this._currentFrame.get('video').get('duration') * this.ENGAGED_WATCHER_PCT;
        if (curTime > this._requiredEngagedSecondsByPct){
          Backbone.Events.trigger('userHook:partialWatch');
          this._markedAsEngaged = true;
        }
      }

      if (this._currentFrame.get('video').get('duration')) {
        this._currentPlayerInfo = {
          currentTime: curTime, duration: this._currentFrame.get('video').get('duration')
        };
      }

    },



    /*
    * When the video ends, count that as a watch
    */
    _onPlaybackStatusChange: function(attr, status){
      if(status === libs.shelbyGT.PlaybackStatus.ended){
        this._currentFrame.watched(true);
        this.trackWatchedCompleteEvent();
        Backbone.Events.trigger('userHook:completeWatch');
      }

      // marking videos as unplayable on specific player errors
      if( status === libs.shelbyGT.PlaybackStatus.error.videoNotFound ||
          status === libs.shelbyGT.PlaybackStatus.error.videoNotEmbeddable ){
        if(this._currentFrame.get('video')){
          this._currentFrame.get('video').markUnplayable();
          shelby.alert({message: "<p>Skipped unplayable video: "+this._currentFrame.get('video').get('title')+"</p>"});
        }
        Backbone.Events.trigger('playback:next');
      }
      // just skip on generic player errors
      if( status === libs.shelbyGT.PlaybackStatus.error.generic ){
        shelby.alert({message: "<p>Skipped video due to playback problems.</p>"});
        Backbone.Events.trigger('playback:next');
      }
    },

    // don't want seeking to look like tons of watching
    _seekByPct: function(attr, seekPct){
      this._userSeeked = true;
    },

    //--------------------------------------
    // The logistics of binding
    //--------------------------------------

    _onNewPlayerState: function(playbackState, newPlayerState){
      var prevPlayerState = playbackState.previous('activePlayerState');
      if( prevPlayerState ){
        prevPlayerState.unbind('change:currentTime', this._onCurrentTimeChange, this);
        prevPlayerState.unbind('change:playbackStatus', this._onPlaybackStatusChange, this);
      }

      newPlayerState.bind('change:currentTime', this._onCurrentTimeChange, this);
      newPlayerState.bind('change:playbackStatus', this._onPlaybackStatusChange, this);
    },

    _frameChanged: function( guideModel, frame ){
      // if we were previously playing another video,
      // have to track a final watch progress event for the segment of that video between
      // the last time we tracked it and now when we stop playing it
      if (guideModel.previous('activeFrameModel') && this._startTime !== null) {
        var finalSegmentSeconds = this._playbackState.get('activePlayerState').get('currentTime') - this._startTime;
        if (!isNaN(finalSegmentSeconds) && finalSegmentSeconds > 0.0) {
          this.trackWatchProgress(finalSegmentSeconds);
          //in case we marked some progress but the video wasn't yet tracked as started, mark it now
          if (!this._markedAsStarted) {
            this.trackWatchStart();
            this._markedAsStarted = true;
          }
        }
      }
      // in case this video got marked as watched by pct but not by absolute seconds
      // we need to track it as having been started
      if (this._markedAsWatched && !this._markedAsStarted) {
        this.trackWatchStart();
        this._markedAsStarted = true;
      }

      this._currentFrame = frame;
      this._startTime = null;
      this._requiredWatchSecondsByPct = frame.get('video').get('duration') ? (frame.get('video').get('duration') * this.WATCHED_PCT) : this.WATCHED_INTERVAL;
      this._requiredEngagedSecondsByPct = frame.get('video').get('duration') ? (frame.get('video').get('duration') * this.ENGAGED_WATCHER_PCT) : this.ENGAGED_INTERVAL;
      this._markedAsStarted = null;
      this._markedAsWatched = null;
      this._markedAsEngaged = null;
      this._currentPlayerInfo = null;
    },

    //----------------------------------
    // Analytics Reporting on when video is watched
    //  == tracked with GA and KISS
    //----------------------------------

    trackWatchStart : function(){
      var _primaryDashboardEntry = this._currentFrame._primaryDashboardEntry;
      var _action = _primaryDashboardEntry ? _primaryDashboardEntry.get('action') : -1;
        shelby.trackEx({
          gaCategory : "Watch",
          gaAction : "Start",
          gaLabel : shelby.models.user.get('nickname') + '::' + _action
        });
    },

    //records what percent of videos are watched, grouped by dbentry action and by user
    trackWatchProgress : function(seconds) {
        var _pctWatched = this.getPctWatched(seconds);
        if (!_pctWatched) {
          return;
        }
        var _primaryDashboardEntry = this._currentFrame._primaryDashboardEntry;
        var _action = _primaryDashboardEntry ? _primaryDashboardEntry.get('action') : -1;
        shelby.trackEx({
          gaCategory : "Watch",
          gaAction : "Progress",
          gaLabel : shelby.models.user.get('nickname') + '::' + _action,
          gaValue : _pctWatched
        });
    },

    trackWatchedEvent : function(currentTime){
      var _pctWatched = this.getPctWatched(currentTime) || 0.0;
      if (_pctWatched > this.EVENT_TRACKING_PCT_THRESHOLD) {
        shelby.track('watched', {frameId: this._currentFrame.id, rollId: this._currentFrame.get('roll_id'), pctWatched: _pctWatched, userName: shelby.models.user.get('nickname')});
        this._markedAsWatched = true;
      }
    },

    getPctWatched : function(time){
      var _duration = this._playbackState.get('activePlayerState').get('duration');
      if (!_duration) {
        return null;
      }
      var _pct = time / _duration;
      return Math.round(_pct * 100) / 100;
    },

    trackWatchedCompleteEvent : function(){
      shelby.track('watched in full', {frameId: this._currentFrame.id, userName: shelby.models.user.get('nickname')});
      var _primaryDashboardEntry = this._currentFrame._primaryDashboardEntry;
      var _action = _primaryDashboardEntry ? _primaryDashboardEntry.get('action') : -1;
      shelby.trackEx({
        gaCategory : "Watch",
        gaAction : "Complete",
        gaLabel : shelby.models.user.get('nickname') + '::' + _action
      });
    }
  };
})();
