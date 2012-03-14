//Events bound (private):
//  hulu:player_ready
//  hulu:on_state_change
//
//Events triggered:
//  video:ended

var HuluPlaybackManager = function(opts){
	var self = this;
	this._divId = opts.divId;
	this._playbackState = opts.playbackState;
	
	this._params = { allowScriptAccess: "always", wmode: "transparent" };
	this._attrs = { id: this._divId };
	
	this._player = null;
	this._currentBroadcast = null;
	
	//should autoplay on initial creation?
	this._shouldAutoplay = true;
	
	// Hulu's NewSite object
	this._hulu = null;
	this._huluCompleteCount = 0 ;
	this._findNewSite = null;
	this._adPlaying = null;
};

HuluPlaybackManager.prototype = new AbstractPlaybackManager();


//---------------------------------------------------
// Required methods
//---------------------------------------------------

HuluPlaybackManager.prototype._playerName = "hulu";

HuluPlaybackManager.prototype.playVideo = function(broadcast, shouldAutoplay){
	this._currentBroadcast = broadcast;
	this._shouldAutoplay = shouldAutoplay;
	this._recordedProgress = false;
	
	if( this._player === null ){
		this._bootstrapPlayer();
	} else {
		if (null === this._currentBroadcast.get('video_id_at_provider')){
			Backbone.Events.trigger("playback:next");
		}	else {
			this._player.playVideo(this._currentBroadcast.get('video_id_at_provider'));
		}
	}
};

HuluPlaybackManager.prototype.stop = function(){
	if( this._player ){ 
		this._player.stopVideo();
		this._playbackState.setPlaying(false);
	}
};

HuluPlaybackManager.prototype.playPause = function(){
	if( this._player ){ 
		this.getCurrentStatus() === "playing" ?	this.pause() : this.play();
	}
};

HuluPlaybackManager.prototype.play = function(){
	if( this._player ){
		this._player.resumeVideo(); 
		this._playbackState.setPlaying(true);
		this._playbackState.setUserPaused(false);
	}
};

HuluPlaybackManager.prototype.pause = function(){
	if( this._player ){
		this._player.pauseVideo(); 
		this._playbackState.setPlaying(false);
		this._playbackState.setUserPaused(true);
	}
};

HuluPlaybackManager.prototype.getCurrentTime = function(){
	if( this._player ){ return this._player.getCurrentTime();}
	else { return "?hulu?"; }
};

HuluPlaybackManager.prototype.getCurrentStatus = function(){
	if( this._player ){ return this._player.getProperties().status; }
	return null;
};


//---------------------------------------------------
// Optional methods
//---------------------------------------------------

HuluPlaybackManager.prototype.seekByPct = function(pct){
	this._player.seek( (pct * this._player.getProperties().duration), true);
};

HuluPlaybackManager.prototype.toggleMute = function(){
	//one call toggles between states
	this._player.mute();
};

HuluPlaybackManager.prototype.setBcastDuration = function(duration){
	if (this._bcast_duration || this._currentBroadcast.get('duration') === 0){
		this._bcast_duration = duration;
		this._currentBroadcast.set({'duration':this._bcast_duration}).save();
	}
	return null;
};


//---------------------------------------------------
// swap in/out
//---------------------------------------------------

HuluPlaybackManager.prototype.swapOutPlayer = function(){
	this._stopMaintainingStatusBar();
	this._playbackState.reset();
};

HuluPlaybackManager.prototype.swapInPlayer = function(){
	if( this._player != null){ this._playbackState.setPlayerLoaded(true); }
	
	//get the playback state ready for us
	this._playbackState.setPlaybackManager(this);
	//and keep the status bar up to date
	this._maintainStatusBar();
};


//---------------------------------------------------
// Private
//---------------------------------------------------

HuluPlaybackManager.prototype._maintainStatusBar = function(){
	//TODO: Hulu has a videoPlayheadUpdate callback which should be used for this
	var self = this;
	this._statusBarMaintainer = setInterval(function(){
		if( self._player ){
			self._playbackState.setDuration(self._player.getProperties().duration);
			self._playbackState.setCurrentTime(self._player.getCurrentTime());

			// for recording playhead progress
			self._percentPlayed = parseFloat((self._player.getCurrentTime() / self._player.getProperties().duration * 100).toFixed(0));
			if (self._percentPlayed == this.options.ogPostAfterPct  && !self._recordedProgress){
				self._recordedProgress = true;
				Backbone.Events.trigger("video:progress", self._percentPlayed);
			}
			
		}
	}, 250);
};

HuluPlaybackManager.prototype._stopMaintainingStatusBar = function(){
	if( this._statusBarMaintainer ){ clearInterval(this._statusBarMaintainer); }
};

HuluPlaybackManager.prototype._bootstrapPlayer = function(){
	var self = this;
	// write to tail of body, where script will be downloaded and run
	var tag = document.createElement('script');
	tag.src = "http://config.hulu.com/js/hulu_global.js?guid=0B1CEA04-DCCB-40cf-AD0E-5222EF66D519&partner=ShelbyTV&wmode=transparent&height=100%&width=100%";
	tag.id = "NS_GUID_JS";
	document.body.appendChild(tag);
	this._findNewSite = setInterval(function(){
		if (typeof NewSite !== "undefined"){
			NewSite.addListener("newsiteReady", self);
			clearInterval(self._findNewSite);
			self._findNewSite = null; 
		}
	}, 200);
	
};


//---------------------------------------------------
// Internal events
//---------------------------------------------------

HuluPlaybackManager.prototype.videoStateChange = function(){
	this._playbackState.setBuffering(false);
	var newState = arguments[0];
	switch(newState) {
		case "stopped": //YT.PlayerState.ENDED:
			//not settings playbackState playing to FALSE as that causes glitch
			//although it's *technically* true that we aren't playing back, we auto-advance to the next
			//video at this point, and flashing the paused screen is not what we want to do.
			//
			break;
		case "playing":
			//console.log("Hulu state PLAYING reported");
			this._playbackState.setPlaying(true);
			this.setBcastDuration(this._player.getProperties().duration);
			Backbone.Events.trigger("playback:error", {playable: true});
			break;
		case "paused":
			//console.log("Hulu state PAUSED reported");
			this._playbackState.setPlaying(false);
			break;
		case "buffering":
			this._playbackState.setBuffering(true);
			break;
		case "loading":
			//console.log("Hulu state LOADING reported");
			break;
		default:
			//console.log("Hulu state **UNKNOWN** reported");
			break;
			//bit bucket
	}
};

HuluPlaybackManager.prototype.newsiteError = function(obj){
	var error = obj.code;
	// HACK: Just going straight to the next video when an error is encountered
	var options = {};
	switch(error) {
		case "NS_JS_008": // content deleted
			break;
		case "NS_JS_009": // content deleted
			break;
		case "NS_JS_007": // video not available in region
			break;
		case "NS_JS_001": // components failed to load 
			options = {"msg":"failed to load component", "persist": false};
			break;
		case "NS_PL_003": // unable to load player
		case "NS_JS_004": // unable to load asset from server
			options = {"msg":"failed to load asset", "persist": false};
			break;
		case "NS_JS_006": // geocheck failed
			options = {"msg":"failed to geo czech", "persist": false};
			break;
		case "NS_JS_012": // timeout
			options = {"msg":"timeout", "persist": false};
			break;
	}
	Backbone.Events.trigger("playback:error", options);
};


//theEnd indicates completion of video, ads & endcard (only triggered when auto-play is disabled).  So we're good to skip now!
HuluPlaybackManager.prototype.theEnd = function(){ Backbone.Events.trigger("playback:next"); };

HuluPlaybackManager.prototype.videoAdBegin = function(){ this._adPlaying = true; };
HuluPlaybackManager.prototype.videoAdEnd = function(){ this._adPlaying = false; };

HuluPlaybackManager.prototype.videoStart = function(type){
	type === "ad" ? this._adPlaying = true : this._adPlaying = false;
};

//only skipping after end card, which is indicated by theEnd, per Hulu contractual agreements
HuluPlaybackManager.prototype.videoComplete = function(s){ /* do nothing, we need theEnd */ };

HuluPlaybackManager.prototype.newsiteReady = function(){
	this._hulu = NewSite;
	this._hulu.adComponent.hide();
	this._player = this._hulu.videoPlayerComponent;
	
	// set event listeners
	var self = this;
	NewSite.addListener("videoStateChange", self);
	NewSite.addListener("newsiteError", self);
	NewSite.addListener("videoComplete", self);
	NewSite.addListener("videoAdBegin", self);
	NewSite.addListener("videoAdEnd", self);
	NewSite.addListener("videoStart", self);
	NewSite.addListener("theEnd", self);
	//NewSite.addListener("relatedVideos", self);
	
	// set volume to max
	this._player.setVolume(100);	
	
	if (this._shouldAutoplay){
		// play video like normal
		this._player.playVideo(this._currentBroadcast.get('video_id_at_provider'));
	}
	else {
		//queue it up but don't autoplay
		this._player.cueVideoById(this._currentBroadcast.get('video_id_at_provider'));
	}

	this._playbackState.setPlayerLoaded(true);
};
