//DOCS: http://www.collegehumor.com/moogaloop/api.php
libs.shelbyGT.CollegeHumorVideoPlayerView = Support.CompositeView.extend({

	id: 'collegehumor-player-holder',
	
	_video: null,
	_player: null,
	
	_playbackState: null,
	
	playerState: null,
		
	initialize: function(opts){
		var self = this;
				
		this._playbackState = opts.playbackState;
		
		this.playerState = new libs.shelbyGT.PlayerStateModel({
			supportsChromeless: true,
			supportsMute: true,
			supportsVolume: false
			});

		//listen to private events
		Backbone.Events.bind("collegehumor:playerReady", this._playerReady, this);
		Backbone.Events.bind("collegehumor:onEnded", this._onEnded, this);
		Backbone.Events.bind("collegehumor:stateChange", function(s) { self._onStateChange(s); });
		Backbone.Events.bind("collegehumor:setCurrentTime", function(t) { self._setCurrentTime(t); });
		Backbone.Events.bind("collegehumor:setDuration", function(d) { self._setDuration(d); });		
	},
	
	//NB: overriding leave b/c we don't usually tear down
	leave: function(){
		//NB: If we decide to tear this down (ie. on low power devices) will need to do some more work in here and call super's leave()
		
		this.pause();
		this.$el.hide();
	},
	
	_cleanup: function(){
		Backbone.Events.unbind("collegehumor:playerReady", this._playerReady, this);
		Backbone.Events.unbind("collegehumor:onEnded", this._onEnded, this);
		Backbone.Events.unbind("collegehumor:stateChange");
		Backbone.Events.unbind("collegehumor:setCurrentTime");
		Backbone.Events.unbind("collegehumor:setDuration");
	},
	
	render: function(container, video){
		this._video = video;
		
		if( !this.playerState.get('playerLoaded') ){
			this._bootstrapPlayer();
		}
		else if( !this.playerState.get('visible') ){
			this.$el.show();
			this.playerState.set({visible:true});
		}
	},
	
	playVideo: function(video){
		this._video = video;
		
		if( this.playerState.get('playerLoaded') ){
			this._player.load_video(this._video.get('provider_id'));
		}
	},

	play: function(){
		if( this._player ){
			this._player.togglePlay(true);
		}
	},

	pause: function(){
		if( this._player ){
			this._player.togglePlay(false); 
		}
	},
	
	//expects pct to be [0.0, 1.0]
	seekByPct: function(pct){
		if( this._player ){
			this._player.seekVideo( (pct * this.playerState.get('duration')) );
		}
	},
	
	mute: function(){ 
		if(this._player){ 
			this._player.setVolume(0);
			this.playerState.set({muted: true});
		} 
	},

	unMute: function(){ 
		if(this._player){ 
			this._player.setVolume(1);
			this.playerState.set({muted: true});
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
	
	_setCurrentTime: function(t){
		this.playerState.set({currentTime:t});
	},

	_setDuration: function(d){
		this.playerState.set({duration:d});
	},

	_onStateChange: function(newState){
		console.log("CH state change". newState);
		switch(newState) {
			case 'ended': 
				// this marks the end of video, but an add plays after this, global callback function used is: detectEndVideo()
				break;
			case 'playing':
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.playing});
				break;
			case 'pause':
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.paused});
				break;
			case 'buffering':
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.buffering});
				break;
			case 'seek':
				break;
			default:
				break;
				//bit bucket
		}
	},

	_onEnded: function(){
		this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.ended});
	},

	_playerReady: function(){
		console.log("ch ready");
		this._player = $("#"+this.id)[0];

		this.playerState.set({playerLoaded: true});

		//auto play is not a config option, need to press play meow...
		if( this._playbackState.get('autoplayOnVideoDisplay') ){ this.play(); }
	},
	
	_bootstrapPlayer: function(){
		console.log("CH boot strap");
		var url = "http://www.collegehumor.com/moogaloop/moogaloop.swf?use_node_id=true&fullscreen=0&clip_id="+this._video.get('provider_id');
		swfobject.embedSWF(url, this.id, "100%", "100%", "9.0.0", null, null, { allowScriptAccess: "always", wmode: "transparent" });
	}
	
});

//Global (and poorly named) functions called by Collegehumor player
function CHPlayerReady(){ Backbone.Events.trigger("collegehumor:playerReady"); }
function getPlayerState(newState){ Backbone.Events.trigger("collegehumor:stateChange", newState); }
function detectEndVideo(){ Backbone.Events.trigger("collegehumor:onEnded"); }
function getCurrentTime(t){ Backbone.Events.trigger("collegehumor:setCurrentTime", t); }
function getDuration(d){ Backbone.Events.trigger("collegehumor:setDuration", d); }