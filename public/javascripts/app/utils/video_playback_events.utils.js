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
    WATCHED_INTERVAL : 20,
    
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
    * since we only post after WATCHED_INTERVAL seconds, and not on video change, this should give us a pretty good
    * idea of what videos were actually watched versus just shown for a few seconds during browsing
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
      
      if( curTime && curTime > this._startTime + this.WATCHED_INTERVAL ){
        this._currentFrame.watched(this._startTime, curTime);        
        this._startTime = curTime;
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
      }

      newPlayerState.bind('change:currentTime', this._onCurrentTimeChange, this);
    },

    _videoChanged: function( guideModel, frame ){
      this._currentFrame = frame;
      this._startTime = 0;
    }
    
  };
})();