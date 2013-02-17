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

    _userSeeked : false,

    //how much playback (in seconds) should eached "watched" interval represent
    WATCHED_INTERVAL : 5,
    //how much playback (by percent) should eached "watched" interval represent
    WATCHED_PCT : 0.20,
    //when to mark video as watched (by percent) for js based even tracking
    EVENT_TRACKING_PCT_THRESHOLD : 10,

    _markedAsWatched : null,

    initialize: function(playbackState, guideModel, userDesires) {
      this._playbackState = playbackState;
      this._guideModel = guideModel;
      this._userDesires = userDesires;

      //track the active frame via guideModel
      this._guideModel.bind('change:activeFrameModel', this._videoChanged, this);

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

    /*
    * If the user watches WATCHED_INTERVAL seconds or WATHCHED_PCT % of the video, count that as a watch
    */
    _onCurrentTimeChange: function(attr, curTime){

      if( this._userSeeked ) {
        // user seeked, we will reset _starTime on the next update
        this._userSeeked = false;
        this._startTime = null;
        return;
      }

      if( this._startTime === null ){
        //resetting _startTime after user seek
        this._startTime = curTime;
        return;
      }

      //can't do any calculations w/o curTime
      if(!curTime) return;

      // did they watch the mininum amount in seconds or by percentage?
      var watchedSeconds = curTime - this._startTime;
      if( watchedSeconds > this.WATCHED_INTERVAL || watchedSeconds > this._requiredWatchPct) {
        this._currentFrame.watched(this._startTime, curTime);
        this._startTime = curTime;

        // If this hasn't been already marked as watched (in the eyes of ourevent tracking), do so.
        if (!this._markedAsWatched) {this.trackWatchedEvent(curTime);}
      }

    },

    /*
    * When the video ends, count that as a watch
    */
    _onPlaybackStatusChange: function(attr, status){
      if(status === libs.shelbyGT.PlaybackStatus.ended){
        this._currentFrame.watched();
        this.trackWatchedCompleteEvent();
      }

      // marking videos as unplayable on specific player errors
      if( status === libs.shelbyGT.PlaybackStatus.error.videoNotFound ||
          status === libs.shelbyGT.PlaybackStatus.error.videoNotEmbeddable ){
        if(this._currentFrame.get('video')){
          this._currentFrame.get('video').markUnplayable();
          shelby.alert({message: "<p>Skipped unplayable video: "+this._currentFrame.get('video').get('title')}+"</p>");
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

    _videoChanged: function( guideModel, frame ){
      this._currentFrame = frame;
      this._startTime = 0;
      this._requireWatchPct = frame.get('video').get('duration') ? (frame.get('video').get('duration') * this.WATCHED_PCT) : this.WATCHED_INTERVAL;
      this._markedAsWatched = null;
    },

    //----------------------------------
    // Analytics Reporting on when video is watched
    //  == tracked with GA and KISS
    //----------------------------------

    trackWatchedEvent : function(currentTime){
      var _duration = shelby.models.playbackState.get('activePlayerState').get('duration');
      var _pctWatched = parseFloat( (currentTime / _duration * 100).toFixed(2) );
      if (_pctWatched > this.EVENT_TRACKING_PCT_THRESHOLD) {
        shelby.track('watched', {frameId: this._currentFrame.id, rollId: this._currentFrame.get('roll_id'), videoDuration: _duration, pctWatched: _pctWatched, userName: shelby.models.user.get('nickname')});
        this._markedAsWatched = true;
      }
    },

    trackWatchedCompleteEvent : function(){
      shelby.track('watched in full', {frameId: this._currentFrame.id, userName: shelby.models.user.get('nickname')});
    }
  };
})();