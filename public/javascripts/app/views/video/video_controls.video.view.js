//
// display and handle the ui elements that controll the current player
//

libs.shelbyGT.VideoControlsView = Support.CompositeView.extend({

	events : {
    "click .play" : "_play",
    "click .pause" : "_pause",
    "click .mute" : "_mute",
    "click .un-mute" : "_unMute",
  },

  el: '#video-controls',

	_currentDuration: 0,

	initialize: function(opts){	
		this._playbackState = opts.playbackState;

    this._playbackState.bind('change:activePlayerState', this._onNewPlayerState, this);

		this.render();
  },

	_cleanup: function() {
    this.model.unbind('change:activePlayerState', this._onNewPlayerState, this);
  },

	template: function(obj){
    return JST['video-controls'](obj);
  },

	render: function(){
		this.$el.html(this.template());
	},


	//--------------------------------------
	// Handle changes of current playerState
	//--------------------------------------

	_onNewPlayerState: function(playbackState, newPlayerState){
		var prevPlayerState = playbackState.previous('activePlayerState');
		if( prevPlayerState ){
			prevPlayerState.unbind('change:playbackStatus', this._onPlaybackStatusChange, this);
			prevPlayerState.unbind('change:currentTime', this._onCurrentTimeChange, this);
			prevPlayerState.unbind('change:bufferTime', this._onBufferTimeChange, this);
			prevPlayerState.unbind('change:duration', this._onDurationChange, this);
			prevPlayerState.unbind('change:muted', this._onMutedChange, this);
			prevPlayerState.unbind('change:volume', this._onVolumeChange, this);
			prevPlayerState.unbind('change:supportsMute', this._onSupportsMuteChange, this);
			prevPlayerState.unbind('change:supportsVolume', this._onSupportsVolumeChange, this);
		}
		
		newPlayerState.bind('change:playbackStatus', this._onPlaybackStatusChange, this);
		newPlayerState.bind('change:currentTime', this._onCurrentTimeChange, this);
		newPlayerState.bind('change:bufferTime', this._onBufferTimeChange, this);
		newPlayerState.bind('change:duration', this._onDurationChange, this);
		newPlayerState.bind('change:muted', this._onMutedChange, this);
		newPlayerState.bind('change:volume', this._onVolumeChange, this);
		newPlayerState.bind('change:supportsMute', this._onSupportsMuteChange, this);
		newPlayerState.bind('change:supportsVolume', this._onSupportsVolumeChange, this);
	},
	
	_onPlaybackStatusChange: function(attr, curState){
		switch(curState){
			case libs.shelbyGT.PlaybackStatus.paused:
				this.$el.removeClass('playing').addClass('paused');
				break;
			case libs.shelbyGT.PlaybackStatus.playing:
				this.$el.removeClass('paused').addClass('playing');
				break;
		}
	},
	
	_onCurrentTimeChange: function(attr, curTime){
		var pct = (curTime / this._currentDuration) * 100;
		//TODO
		console.log("TODO: move scrubber to "+pct+"%");
	},
	
	_onBufferTimeChange: function(attr, bufferTime){
		var pct = (bufferTime / this._currentDuration) * 100;
		//TODO
		console.log("TODO: expand buffer width to "+pct+"%");
	},
	
	_onDurationChange: function(attr, val){
		this._currentDuration = val;
	},
	
	_onMutedChange: function(attr, muted){
		muted ? this.$el.addClass('muted') : this.$el.removeClass('muted');
	},
	
	_onVolumeChange: function(attr, volPct){
		//TODO
		console.log("TODO: move volume slider to "+volPct+"%");
	},
	
	_onSupportsMuteChange: function(attr, supportsMute){
		supportsMute ? this.$el.removeClass('disable-mute') : this.$el.addClass('disable-mute');
	},
	
	_onSupportsVolumeChange: function(attr, supportsVolume){
		supportsVolume ? this.$el.removeClass('disable-volume') : this.$el.addClass('disable-volume');
	},
	
	
	//--------------------------------------
	// Handle user events on the player controls
	//--------------------------------------
	
	_play: function(el){
		console.log("TODO: user desires play");
	},
	
	_pause: function(el){
		console.log("TODO: user desires pause");
	},
	
	_mute: function(el){
		console.log("TODO: user desires mute");
	},
	
	_unMute: function(el){
		console.log("TODO: user desires unmute");
	}
	
	//TODO: handle scrubbing
	
	//TODO: handle volume change
	

});