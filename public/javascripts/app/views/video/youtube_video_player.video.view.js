libs.shelbyGT.YouTubeVideoPlayerView = Support.CompositeView.extend({

	id: 'youtube-player-holder',
	
	_video: null,
	_player: null,
	
	_playbackState: null,
	
	playerState: null,
		
	initialize: function(opts){
		this._playbackState = opts.playbackState;
		
		this.playerState = new libs.shelbyGT.PlayerStateModel({
			supportsChromeless: true,
			supportsMute: true,
			supportsVolume: true
			});
		
		//listen for the echo of events from YouTube (b/c it calls a global method)
		Backbone.Events.bind("youtube:playerAPIReady", this._onPlayerAPIReady, this);
	},
	
	//NB: overriding leave b/c we don't usually tear down
	leave: function(){
		//NB: If we decide to tear this down (ie. on low power devices) will need to do some more work in here and call super's leave()
		
		this.pause();
		this.$el.hide();
		this.$el.css('z-index', '-1');
		this.playerState.set({visible:false});
		
		this._playheadTrackingOff();
	},
	
	_cleanup: function(){
		Backbone.Events.unbind("youtube:playerAPIReady", this._onPlayerAPIReady, this);
	},
	
	render: function(container, video){
		if( !this.playerState.get('playerLoaded') ){
		  this._video = video;
			this._bootstrapPlayer();
		}
		else if( !this.playerState.get('visible') ){
			this.$el.show();
			this.$el.css('z-index', '1');
			this.playerState.set({visible:true});
			//playVideo will be called by video display view
		}
		
		this._playheadTrackingOn();
	},
	
	playVideo: function(video){	  
		if( this.playerState.get('playerLoaded') ){
			if( this._video === video ){
				this.play();
			} else {
				//load up new video
				
				//video id, start time, quality (https://developers.google.com/youtube/js_api_reference#loadVideoById)
				// default: YouTube selects the appropriate playback quality. (https://developers.google.com/youtube/js_api_reference#Playback_quality)
				this._player.loadVideoById(video.get('provider_id'), 0, 'default');
			}
		}
		
		this._video = video;
	},

	play: function(){
		if( this._player ){
			this._player.playVideo();
		}
	},

	pause: function(){
		if( this._player ){
			this._player.pauseVideo(); 
		}
	},
	
	//expects pct to be [0.0, 1.0]
	seekByPct: function(pct){
		if( this._player ){ this._player.seekTo( (pct * this._player.getDuration()), true); }
	},
	
	mute: function(){
		if( this._player ){
			this._player.mute();
			this.playerState.set({muted: true});
		}
	},
	
	unMute: function(){
		if( this._player ){
			this._player.unMute();
			this.playerState.set({muted: false});
		}
	},
	
	//expects pct to be [0.0, 1.0]
	setVolume: function(pct){
		if( this._player ){
			this._player.setVolume(pct*100);
			this.playerState.set({volume: pct});
		}
	},
	
	//---------------------------------------------------
	// Private
	//---------------------------------------------------
	
	_updateDuration: function(){
		if( this._player ){	this.playerState.set({duration:this._player.getDuration()}); }
	},
	
	_playheadTrackingInterval: null,
	
	_playheadTrackingOn: function(){
		var self = this;
		
		if( this._playheadTrackingInterval === null ){
			this._playheadTrackingInterval = setInterval(function(){
				if(self._player){ self.playerState.set({currentTime:self._player.getCurrentTime()}); }
			}, 250);
		}
	},
	
	_playheadTrackingOff: function(){
		if( this._playheadTrackingInterval !== null ){
			clearInterval(this._playheadTrackingInterval);
			this._playheadTrackingInterval = null;
		}
	},
	
	//---------------------------------------------------
	// Internal events
	//---------------------------------------------------
	
	_onStateChange: function(event){
		this._updateDuration();
		
		switch(event.data) {
			case 0: //YT.PlayerState.ENDED:
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.ended});
				break;
			case 1: //YT.PlayerState.PLAYING
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.playing});
				break;
			case 2: //YT.PlayerState.PAUSED
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.paused});
				break;
			case 3: //YT.PlayerState.BUFFERING
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.buffering});
				break;
			case 5: //YT.PlayerState.CUED
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.cued});
				break;
			default:
				//console.log("YT state **UNKNOWN** reported");
				break;
				//bit bucket
		}
	},
	
	_onError: function(event){
		switch(event.data) {
			case 2: // error code is broadcast when a request contains an invalid parameter
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.error.generic});
				break;
			case 100: //YT video requested is not found:
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.error.videoNotFound});
				break;
			case 101: //YT video requested does not allow playback in the embedded players
			case 150: //same as 101
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.error.videoNotEmbeddable});
				break;
			default:
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.error.generic});
				break;
		}
	},
	
	_onPlayerReady: function(e){
		//YT replaces the div backbone is holding with it's own, so we need to update this view
		//could use e.target.a but that's not documented, so I'm trying to be future-proof
		this.setElement($('#'+this.id));
		
		this._player = e.target;
		
		this.$el.css('z-index', '1');
		this.playerState.set({playerLoaded: true});
		this.playerState.set({visible:true});
		
		//TODO: set volume via this._playbackState.get('desiredVolume')
	},
	
	_onPlayerAPIReady: function(){
		var self = this;
		
		var unreadyPlayer = new YT.Player(this.id, {
			width: '100%',
			height: '100%',
			playerVars: { 
				'rel': 0,
				'controls': 0,
				'disablekb': 1, //disable YouTubes keyboard controls (and keep ours)
				'enablejsapi': 1,
				'wmode': 'transparent',
				'autoplay': (this._playbackState.get('autoplayOnVideoDisplay') ? 1 : 0),  // <-- this is ignored in iOS 4
				'showinfo': 0,
				'modestbranding': 1,
				'origin': window.location.host
			},
			videoId: this._video.get('provider_id'),
			events: {
				'onStateChange': function(e){ self._onStateChange(e); },
				'onError': function(e){ self._onError(e); },
				'onReady': function(e){ self._onPlayerReady(e); }
				}
		});
	},
	
	_bootstrapPlayer: function(){	
		var tag = document.createElement('script');
		tag.src = "http://www.youtube.com/player_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		//NB: when the player is ready, it calls the global function onYouTubePlayerAPIReady() - below
	}
});

//Global function called by the YouTube iframe player
function onYouTubePlayerAPIReady() {
	Backbone.Events.trigger("youtube:playerAPIReady");
}