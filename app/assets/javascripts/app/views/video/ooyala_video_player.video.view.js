libs.shelbyGT.OoyalaVideoPlayerView = Support.CompositeView.extend({

	id: 'ooyala-player-holder',
	
	_video: null,
	_player: null,
	
	_playbackState: null,
	
	playerState: null,
		
	initialize: function(opts){
		var self = this;
		
		this._playbackState = opts.playbackState;
		
		this.playerState = new libs.shelbyGT.PlayerStateModel({
		  playerView: this,
			supportsChromeless: true,
			supportsMute: true,
			supportsVolume: true
			});
		
		//listen to private events
		Backbone.Events.bind("ooyala:onFinish", this._onFinish, this);
		Backbone.Events.bind("ooyala:onApiReady", function(playerId) { self._onApiReady(playerId); });
		Backbone.Events.bind("ooyala:setCurrentTime", function(p) { self._setCurrentTime(p); });
		Backbone.Events.bind("ooyala:setDuration", function(d) { self._setDuration(d); });
		Backbone.Events.bind("ooyala:stateChanged", function(s, e) { self._stateChanged(s, e); });
	},
	
	//NB: overriding leave b/c we don't usually tear down
	leave: function(){
		//NB: If we decide to tear this down (ie. on low power devices) will need to do some more work in here and call super's leave()
		
		this.pause();
		this.$el.css('visibility', 'hidden');
		this.$el.css('z-index', '-1');
		this.playerState.set({visible:false});
	},
	
	_cleanup: function(){
		Backbone.Events.unbind("ooyala:onFinish", this._onFinish(), this);
		Backbone.Events.unbind("ooyala:onApiReady");
		Backbone.Events.unbind("ooyala:setCurrentTime");
		Backbone.Events.unbind("ooyala:setDuration");
		Backbone.Events.unbind("ooyala:stateChanged");
	},
	
	render: function(container, video){
		if( !this.playerState.get('playerLoaded') ){
		  this._video = video;
			this._bootstrapPlayer();
		}
		else if( !this.playerState.get('visible') ){
			this.$el.css('visibility', 'visible');
			this.$el.css('z-index', '1');
			this.playerState.set({visible:true});
			//playVideo will be called by video display view
		}
	},
	
	playVideo: function(video){
		if( this.playerState.get('playerLoaded') ){
			if( this._video === video ){
				this.play();
			} else {
				//load up new video
				this._player.setQueryStringParameters({embedCode:video.get('provider_id'), autoplay:(this._playbackState.get('autoplayOnVideoDisplay') ? 1 : 0)});
			}
		}
		
		this._video = video;
	},

	play: function(){
		if( this._player ){
			this._player.playMovie();
		}
	},

	pause: function(){
		if( this._player ){
			this._player.pauseMovie(); 
		}
	},
	
	//expects pct to be [0.0, 1.0]
	seekByPct: function(pct){
		if( this._player ){
			this._player.setPlayheadTime( (pct * this._player.getTotalTime()) );
		}
	},
	
	mute: function(){ 
		if(this._player){ 
			this._player.setVolume(0.0);
			this.playerState.set({muted: true});
			this.playerState.set({volume: this._player.getVolume()});
		} 
	},

	unMute: function(){ 
		if(this._player){ 
			this._player.setVolume(1.0);
			this.playerState.set({muted: false});
			this.playerState.set({volume: this._player.getVolume()});
		} 
	},

	//expects pct to be [0.0, 1.0]
	setVolume: function(pct){
		if(this._player){ 
			this._player.setVolume(pct);
			this.playerState.set({volume: pct});
		}
	},
	
	//---------------------------------------------------
	// Private
	//---------------------------------------------------
	
	
	//---------------------------------------------------
	// Internal events
	//---------------------------------------------------
	
	_setCurrentTime: function(p){ 
		this.playerState.set({currentTime:p.playheadTime || p.newPlayheadTime});
	},

	_setDuration: function(d){ 
		this.playerState.set({duration:d});
	},
	
	_onFinish: function(){
		this._player.pauseMovie();
		this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.ended});
	},

	//states passed by ooyala are [playing, paused, buffering, stopped] and i send [adStarted, adCompleted] 
	//which we get from a different, specific callback
	_stateChanged: function(state, errorCode){

		switch(state){
			case 'playing':
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.playing});
				break;
			case 'buffering':
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.buffering});
				break;
			case 'paused':
			case 'stopped':
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.paused});
				break;
			case 'adStarted':
			case 'adCompleted':
			  // ooyala fires "playComplete" which is handled by _onFinish above to signal end of video
				break;
		  case 'error':
			  this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.error.generic});
			  break;
		}
	},
	
	_onApiReady: function(playerId){
		//Ooyala replaces the div backbone is holding with it's own, so we need to update this view
		this.setElement($('#'+this.id));
		
		//onApiReady is called everytime the embed changes, so only need to set _player the first time
		if( this._player === null ){ this._player = $("#"+playerId)[0]; }
		
		this.$el.css('z-index', '1');
		this.playerState.set({playerLoaded: true});
		this.playerState.set({visible:true});
		
		this._playbackState.setDuration(this._player.getTotalTime());
	},
	
	_bootstrapPlayer: function(){
		var src = "http://www.ooyala.com/player.js?playerContainerId="+this.id+"&callback=receiveOoyalaEvent&playerId=ooyalaPlayer&wmode=transparent&embedCode="+this._video.get('provider_id')+"&version=2&autoplay="+(this._playbackState.get('autoplayOnVideoDisplay') ? "1" : "0");

		//write to head, where script will be downloaded and run
		var tag = document.createElement('script');
		tag.src = src;

		//Firefox 3.6.x doesn't support document.head
		(document.head || document.getElementsByTagName( "head" )[0]).appendChild(tag);
	}
	
});

//Global function called by Ooyala player
function receiveOoyalaEvent(playerId, eventName, params){
	switch(eventName){
		case 'playComplete':
			Backbone.Events.trigger("ooyala:onFinish");
			break;
		case 'apiReady':
			Backbone.Events.trigger("ooyala:onApiReady", playerId);
			break;
		case 'stateChanged':
			Backbone.Events.trigger("ooyala:stateChanged", params.state, params.errorCode);
			break;
		case 'adStarted':
			Backbone.Events.trigger("ooyala:stateChanged", 'adStarted');
			break;
		case 'adCompleted':
			Backbone.Events.trigger("ooyala:stateChanged", 'adCompleted');
			break;
		case 'playheadTimeChanged':
		case 'seeked':
			Backbone.Events.trigger("ooyala:setCurrentTime", params);
			break;
		case 'totalTimeChanged':
			Backbone.Events.trigger("ooyala:setDuration", params.totalTime);
			break;
	}
}