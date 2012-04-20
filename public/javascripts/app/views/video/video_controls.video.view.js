//
// display and handle the ui elements that controll the current player
//

libs.shelbyGT.VideoControlsView = Support.CompositeView.extend({

	events : {
    "click .js-paused button.video-player-play" : "_play",
    "click .js-playing button.video-player-play" : "_pause",
    "click .unmute" : "_mute",
    "click .mute" : "_unMute",
    "click .video-player-progress": "_onScrubTrackClick",
    "click .video-player-fullscreen" : "_toggleFullscreen",
    "click .video-player-roll" : "_rollActiveFrame"
  },

  el: '#video-controls',

	_currentDuration: 0,
	
	_shouldUpdateScrubHandle: true,

	initialize: function(opts){	
		this._playbackState = opts.playbackState;
		this._userDesires = opts.userDesires;
		
		this._userDesires.bind('change:guideShown', this._guideVisibilityChange, this);
		
		this._playbackState.bind('change:activePlayerState', this._onNewPlayerState, this);
		if( this._playbackState.get('activePlayerState') !== null ) {
		  this._onNewPlayerState(this._playbackState, this._playbackState.get('activePlayerState'));
		}
  },

	_cleanup: function() {
	  this._userDesires.unbind('change:guideShown', this._guideVisibilityChange, this);
	  
    this.model.unbind('change:activePlayerState', this._onNewPlayerState, this);
  },

	template: function(obj){
    return JST['video-controls'](obj);
  },

	render: function(){
		this.$el.html(this.template());
		if( this._playbackState.get('activePlayerState') === null ) {
		  this.$el.addClass('js-disabled');
	  }
	  
	  var self = this;
	  this.$('.video-player-scrubber').draggable({axis: 'x', containment: 'parent',
	    start: function(event, ui){ self._onScrubberDragStart(event, ui); },
	    stop:  function(event, ui){ self._onScrubberDragStop(event, ui); } });
	},


	//--------------------------------------
	// Handle changes of current playerState
	//--------------------------------------

	_onNewPlayerState: function(playbackState, newPlayerState){
	  this.$el.removeClass('js-disabled');
	  
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
		
		this.render();
	},
	
	_onPlaybackStatusChange: function(attr, curState){
		switch(curState){
			case libs.shelbyGT.PlaybackStatus.paused:
				this.$el.removeClass('js-playing').addClass('js-paused');
				this.$('.video-player-play').removeClass('pause');
				break;
			case libs.shelbyGT.PlaybackStatus.playing:
				this.$el.removeClass('js-paused').addClass('js-playing');
				this.$('.video-player-play').addClass('pause');
				break;
			case libs.shelbyGT.PlaybackStatus.ended:
				Backbone.Events.trigger('playback:next');
				break;
		}
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

		var durationH = parseInt(val / 3600, 10 ) % 60,
		durationM = parseInt(val / 60, 10 ) % 60,
		durationS = parseInt(val % 60, 10);
		
		this.$('.video-player-timeline  span:last-child').text(prettyTime(durationH, durationM, durationS));
	},
	
	_onMutedChange: function(attr, muted){
		muted ? this.$el.addClass('muted') : this.$el.removeClass('muted');
	},
	
	_onVolumeChange: function(attr, volPct){
		//TODO
		//console.log("TODO: move volume slider to "+volPct+"%");
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
    //to make sure a change event is fired, first unset this attribute
    this._userDesires.unset('playbackStatus');
    this._userDesires.set({playbackStatus: libs.shelbyGT.PlaybackStatus.playing});
	},
	
	_pause: function(el){
    //to make sure a change event is fired, first unset this attribute
    this._userDesires.unset('playbackStatus');
    this._userDesires.set({playbackStatus: libs.shelbyGT.PlaybackStatus.paused});
	},
	
	_mute: function(el){
		this._userDesires.set({mute: true});
		this.$('.video-player-volume').toggleClass('mute').toggleClass('unmute');
	},
	
	_unMute: function(el){
		this._userDesires.set({mute: false});
		this.$('.video-player-volume').toggleClass('mute').toggleClass('unmute');
	},
	
	_onScrubTrackClick: function(el){
	  this._doRelativeSeek(el.pageX);
  },
  
  _onScrubberDragStart: function(event, ui){
    this._shouldUpdateScrubHandle = false;
  },
  
  _onScrubberDragStop: function(event, ui){
    this._shouldUpdateScrubHandle = true;
    this._doRelativeSeek(event.pageX);
  },
	
	_toggleFullscreen: function(){
		if (shelby.fullScreen.available()){
			!shelby.fullScreen.activated() ? shelby.fullScreen.request() : shelby.fullScreen.cancel();
		}
		// TODO: change icon if fullscreen is activated
	},

  _rollActiveFrame: function(){
    shelby.views.guide.rollActiveFrame();
  },

	//TODO: handle volume change this._userDesires.set({volume: (clickPositionPct) })
	
	//--------------------------------------
	// handle user desires
	//--------------------------------------
	
	_guideVisibilityChange: function(attr, guideShown){
    if( guideShown ){
      this.$el.find('.video-player-controls').removeClass("full-width");
    } else {
      this.$el.find('.video-player-controls').addClass("full-width");
    }
  },
	
	
	//--------------------------------------
	// helpers
	//--------------------------------------
	
	_doRelativeSeek: function(pageX){
    var scrubTrack = this.$('.video-player-progress');
    var seekPct = ( (pageX - scrubTrack.offset().left) / scrubTrack.width() );
    seekPct = Math.min(Math.max(seekPct, 0.0), 1.0);
    this._userDesires.set({currentTimePct: seekPct});
  }
	

});
