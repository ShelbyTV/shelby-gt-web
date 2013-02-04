libs.shelbyGT.HuluVideoPlayerView = Support.CompositeView.extend({

	id: 'hulu-player-holder',

	_video: null,
	_player: null,

	_playbackState: null,

	playerState: null,

	initialize: function(opts){
		this._playbackState = opts.playbackState;

		this.playerState = new libs.shelbyGT.PlayerStateModel({
		  playerView: this,
			supportsChromeless: true,
			supportsMute: true,
			supportsVolume: true
			});
	},

	//NB: overriding leave b/c we don't usually tear down
	leave: function(){
		//NB: If we decide to tear this down (ie. on low power devices) will need to do some more work in here and call super's leave()

		this.pause();
		//hulu's player knows how to hide itself, how kind
		if( this._player ){ this._player.hide(); }
		this.playerState.set({visible:false});

		$("#js-video-controls").show();
	},

	_cleanup: function(){
	},

	render: function(container, video){
		if( !this.playerState.get('playerLoaded') ){
		  this._video = video;
			this._bootstrapPlayer();
		}
		else if( !this.playerState.get('visible') ){
			this._player.show();
			this.playerState.set({visible:true});
			//playVideo will be called by video display view
		}

		$("#js-video-controls").hide();
	},

	playVideo: function(video){
		if( this.playerState.get('playerLoaded') ){
			if( this._video === video ){
				this.play();
			} else {
				//load up new video
				this._player.playVideo(video.get('provider_id'));
			}
		}

		this._video = video;
	},

	play: function(){
		if( this._player ){
			this._player.resumeVideo();
		}
	},

	pause: function(){
		if( this._player ){
			this._player.pauseVideo();
		}
	},

	//expects pct to be [0.0, 1.0]
	seekByPct: function(pct){
		if( this._player ){ this._player.seek( (pct * this._player.getProperties().duration), true); }
	},

	// Hulu only has "mute" which toggles but provides no way for us to get the current state.
	// It's safer to use setVolume and explicity state what we want/expect
	mute: function(){
		if( this._player ){
			this._player.setVolume(0);
			this.playerState.set({muted: true});
			this.playerState.set({volume: 0});
		}
	},

	unMute: function(){
		if( this._player ){
			this._player.setVolume(1);
			this.playerState.set({muted: false});
			this.playerState.set({volume: 1});
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
		if( this._player ){	this.playerState.set({duration:this._player.getProperties().duration}); }
	},

	//---------------------------------------------------
	// Internal events
	//---------------------------------------------------

	_onPlayheadUpdate: function(update){
		this.playerState.set({duration:update.duration});
		this.playerState.set({currentTime:update.position});
	},

	_onError: function(obj){
		var error = obj.code;

		var options = {};
		switch(error) {
		  case "NS_JS_004": // unable to load asset from server
			case "NS_JS_008": // content deleted
			case "NS_JS_009": // content deleted
			  this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.error.videoNotFound});
				break;
			case "NS_JS_001": // components failed to load
			case "NS_PL_003": // unable to load player
			case "NS_JS_006": // geocheck failed
			case "NS_JS_007": // video not available in region
			case "NS_JS_012": // timeout
			default:
			  this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.error.generic});
				break;
		}

		//just using generic error all the time for Hulu for now
		this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.error.generic});
	},

	_onVideoStateChange: function(){
		this._updateDuration();

		var newState = arguments[0];
		switch(newState) {
			case "stopped": //YT.PlayerState.ENDED:
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.paused});
				break;
			case "playing":
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.playing});
				break;
			case "paused":
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.paused});
				break;
			case "buffering":
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.buffering});
				break;
			case "loading":
				//console.log("Hulu state LOADING reported");
				break;
			default:
				//console.log("Hulu state **UNKNOWN** reported");
				break;
				//bit bucket
		}
	},

	//not actually done until the end card, per Hulu contractual agreements
	_onVideoComplete: function(s){ /* do nothing, we need theEnd */ },

	//theEnd indicates completion of video, ads & endcard (only triggered when auto-play is disabled).  So we're really ENDED now
	_onTheEnd: function(){ this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.ended}); },

	_onVideoAdBegin: function(){ this._adPlaying = true; },
	_onVideoAdEnd: function(){ this._adPlaying = false; },

	_onVideoStart: function(type){
		if( type === "ad" ){
			this._adPlaying = true;
		} else {
			this._adPlaying = false;
			this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.playing});
		}
	},

	_onNewsiteReady: function(){
		this._hulu = NewSite;
		this._hulu.adComponent.hide();
		this._player = this._hulu.videoPlayerComponent;

		// set event listeners
		NewSite.addListener("videoStateChange", this, "_onVideoStateChange");
		NewSite.addListener("newsiteError", this, "_onError");
		NewSite.addListener("videoComplete", this, "_onVideoComplete");
		NewSite.addListener("videoAdBegin", this, "_onVideoAdBegin");
		NewSite.addListener("videoAdEnd", this, "_onVideoAdEnd");
		NewSite.addListener("videoStart", this, "_onVideoStart");
		NewSite.addListener("theEnd", this, "_onTheEnd");
		NewSite.addListener("videoPlayheadUpdate", this, "_onPlayheadUpdate");

		if (this._playbackState.get('autoplayOnVideoDisplay')){
			// play video like normal
			this._player.playVideo(this._video.get('provider_id'));
		}
		else {
			//queue it up but don't autoplay
			this._player.cueVideoById(this._currentBroadcast.get('video_id_at_provider'));
		}

		this.playerState.set({playerLoaded: true});
		this.playerState.set({visible:true});
	},

	_bootstrapPlayer: function(){
		var self = this;

		// write to tail of body, where script will be downloaded and run
		var tag = document.createElement('script');
		tag.src = "http://config.hulu.com/js/hulu_global.js?guid=0B1CEA04-DCCB-40cf-AD0E-5222EF66D519&partner=ShelbyTV&wmode=transparent&height=100%&width=100%";
		tag.id = "NS_GUID_JS";
		document.body.appendChild(tag);

		this._findNewSite = setInterval(function(){
			if (typeof NewSite !== "undefined"){
				if (NewSite.readyEventFired()) {
					this._newsiteReady();
				} else {
					NewSite.addListener("newsiteReady", self, "_onNewsiteReady");
				}
				clearInterval(self._findNewSite);
				self._findNewSite = null;
			}
		}, 200);

	}
});
