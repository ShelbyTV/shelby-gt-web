libs.shelbyGT.DailyHumorVideoPlayerView = Support.CompositeView.extend({

	id: 'dailyhumor-player-holder',
	
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
			supportsVolume: true
			});
		
		//listen to private events
		Backbone.Events.bind("dailymotion:playerReady", function(id) { self._playerReady(id); });
		Backbone.Events.bind("dailymotion:onStateChange", function(s) { self._onStateChange(s); });
		Backbone.Events.bind("dailymotion:onVideoProgress", function(p) { self._onVideoProgress(p); });
		Backbone.Events.bind("dailymotion:onVideoMetadata", function(m) { self._onVideoMetadata(m); });
	},
	
	leave: function(){
		//daily motion gets torn down every time, don't need to _cleanup tho (those bindings are still good, don't want to re-bind)
		this.pause();
		this.$el.remove();
		this._player = null;
		this.playerState.set({playerLoaded:true});
	},
	
	_cleanup: function(){
		Backbone.Events.unbind("dailymotion:playerReady");
		Backbone.Events.unbind("dailymotion:onStateChange");
		Backbone.Events.unbind("dailymotion:onVideoProgress");
		Backbone.Events.unbind("dailymotion:onVideoMetadata");
	},
	
	render: function(container, video){
		this._video = video;
		
		if( !this.playerState.get('playerLoaded') ){
			this._bootstrapPlayer();
		}
		else if( !this.playerState.get('visible') ){
			this.$el.css('visibility', 'visible');
			this.playerState.set({visible:true});
		}
	},
	
	playVideo: function(video){
		this._video = video;
		
		if( this.playerState.get('playerLoaded') ){
			this._player.api_loadVideo(this._video.get('provider_id'));
		}
	},

	play: function(){
		if( this._player ){
			if( this._player.getPlayerState() === -1 ){
				//player is "unstarted" which happens when autoplay is off.
				//when autoplay is off, dailymotion player won't .playVideo after initial load. You need to loadVideoById to actually play the video...
				this._player.loadVideoById(this._video.get('provider_id'));
			} else {
				this._player.playVideo();
			}
		}
	},

	pause: function(){
		if( this._player ){
			this._player.pauseVideo();
		}
	},
	
	//expects pct to be [0.0, 1.0]
	seekByPct: function(pct){
		if( this._player ){
			this._player.seekTo( (pct * this._player.getDuration()) );
		}
	},
	
	mute: function(){ 
		if(this._player){ 
			this._player.mute();
			this.playerState.set({muted: true});
			this.playerState.set({volume: this._player.getVolume()});
		} 
	},

	unMute: function(){ 
		if(this._player){ 
			this._player.unMute();
			this.playerState.set({muted: false});
			this.playerState.set({volume: this._player.getVolume()});
		} 
	},

	//expects pct to be [0.0, 1.0]
	setVolume: function(pct){
		if(this._player){ 
			this._player.setVolume(pct*100);
			this.playerState.set({volume: this._player.getVolume()});
		}
	},
	
	//---------------------------------------------------
	// Private
	//---------------------------------------------------
	
	
	//---------------------------------------------------
	// Internal events
	//---------------------------------------------------

	_onVideoProgress: function(p){ 
		this.playerState.set({currentTime:p.mediaTime});
	},

	_onVideoMetadata: function(m){
		this.playerState.set({duration:parseFloat(m.videoDuration)});
	},

	_onStateChange: function(newState){
		switch(newState) {
			case 0: //DM.PlayerState.ENDED:
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.ended});
				break;
			case 1: //DM.PlayerState.PLAYING
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.playing});
				break;
			case 2: //DM.PlayerState.PAUSED
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.paused});
				break;
			case 3: //DM.PlayerState.BUFFERING
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.buffering});
				break;
			case 5: //DM.PlayerState.CUED
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.cued});
				break;
			default:
				//bit bucket
				break;
		}
	},	

	_playerReady: function(playerId){
		//DailyMotion replaces the div backbone is holding with it's own, so we need to update this view
		this.setElement($('#'+this.id));
		
		this._player = $("#"+playerId)[0];	
		this._player.addEventListener("onStateChange", "function(s){ Backbone.Events.trigger('dailymotion:onStateChange', s) }");
		this._player.addEventListener("onVideoProgress", "function(p){ Backbone.Events.trigger('dailymotion:onVideoProgress', p) }");
		this._player.addEventListener("onVideoMetadata", "function(m){ Backbone.Events.trigger('dailymotion:onVideoMetadata', m) }");
		
		this.playerState.set({playerLoaded:true});
	},
	
	_bootstrapPlayer: function(){
		var url = "http://www.dailymotion.com/swf/"+this._video.get('provider_id')+"&enableApi=1&autoPlay="+(this._playbackState.get('autoplayOnVideoDisplay') ? "1" : "0")+"&chromeless=1&playerapiid="+this.id;
		swfobject.embedSWF(url, this.id, "100%", "100%", "9.0.0", null, null, { allowScriptAccess: "always", wmode: "transparent" }, { id: this.id });
	}
});

//Global funciton called by DailyMotion player
function onDailymotionPlayerReady(playerId) {
	Backbone.Events.trigger("dailymotion:playerReady", playerId);
}