//
// display the current progress very inconspicously on the bottom of the screen when other controls have faded out
//

libs.shelbyGT.MiniVideoProgress = Support.CompositeView.extend({

  el: '#mini-video-progress',
  
  _currentDuration: 0,
  
  initialize: function(opts){	
		this._playbackState = opts.playbackState;
		
		//NO NEED I THINK this._userDesires.bind('change:guideShown', this._guideVisibilityChange, this);
		
		this._playbackState.bind('change:activePlayerState', this._onNewPlayerState, this);
		if( this._playbackState.get('activePlayerState') !== null ) {
      this._onNewPlayerState(this._playbackState, this._playbackState.get('activePlayerState'));
		}
  },

	_cleanup: function() {
    this.model.unbind('change:activePlayerState', this._onNewPlayerState, this);
  },
  
  //--------------------------------------
	// Handle changes of current playerState
	//--------------------------------------

	_onNewPlayerState: function(playbackState, newPlayerState){
		var prevPlayerState = playbackState.previous('activePlayerState');
		if( prevPlayerState ){
			prevPlayerState.unbind('change:currentTime', this._onCurrentTimeChange, this);
			prevPlayerState.unbind('change:bufferTime', this._onBufferTimeChange, this);
			prevPlayerState.unbind('change:duration', this._onDurationChange, this);
		}
		
		newPlayerState.bind('change:currentTime', this._onCurrentTimeChange, this);
		newPlayerState.bind('change:bufferTime', this._onBufferTimeChange, this);
		newPlayerState.bind('change:duration', this._onDurationChange, this);
	},
	
	_onCurrentTimeChange: function(attr, curTime){
		var pct = (curTime / this._currentDuration) * 100;
		if( this._shouldUpdateScrubHandle ){
      this.$('.video-player-scrubber').css('left',pct+"%");
    }
    
		var curTimeH = parseInt(curTime / (60*60), 10 ) % 60,
        curTimeM = parseInt(curTime / 60, 10 ) % 60,
        curTimeS = parseInt(curTime % 60, 10);

		this.$('.video-player-progress-elapsed').width(pct+"%");
		this.$('.video-player-timeline  span:first-child').text(prettyTime(curTimeH, curTimeM, curTimeS));
	},
	
	_onBufferTimeChange: function(attr, bufferTime){
		var pct = (bufferTime / this._currentDuration) * 100;
		this.$('.video-player-progress-load').width(pct+"%");
	},
	
	_onDurationChange: function(attr, val){
		this._currentDuration = val;
	}
	
});