//Currently YouTube iframe player is implemented.  It chooses flash or html5 based on environment.
//
// *MOBILE NOTE* iOS restricts automatic/programtic playback of html5 video (at least now, on iOS 4).  The user first has to 
// click the play button on the player from youtube, then the play/pause of the API will work.
//
//
//Events bound (private):
//  youtube:player_ready
//  youtube:on_state_change
//
//Events triggered:
//  video:ended

var YouTubeHTML5PlaybackManager = function(opts){
	var self = this;
	this._divId = opts.divId;
	this._playbackState = opts.playbackState;
	
	this._player = null;
	this._currentBroadcast = null;
		
	//should autoplay on initial creation?
	this._shouldAutoplay = true;

	// for swapping player in and out
	this._ensurePauseLoop = null;
	
	//for the iOS hack
	this._userHasInitiatedPlayback = false;
	
	this._swappedIn = false;
	
	//listen to private events
	Backbone.Events.bind("youtube:playerAPIReady", function() { self._onPlayerAPIReady(); });
	Backbone.Events.bind("youtube:playerReady", function(e) { self._onPlayerReady(e); });
	Backbone.Events.bind("youtube:onStateChange", function(s) { self._onStateChange(s); });
	Backbone.Events.bind("youtube:onError", function(s) { self._onError(s); });
};

YouTubeHTML5PlaybackManager.prototype = new AbstractPlaybackManager();


//---------------------------------------------------
// Required methods
//---------------------------------------------------

YouTubeHTML5PlaybackManager.prototype._playerName = "you-tube-iframe";

YouTubeHTML5PlaybackManager.prototype.playVideo = function(broadcast, shouldAutoplay){
	this._currentBroadcast = broadcast;
	this._shouldAutoplay = shouldAutoplay;
	this._recordedProgress = false;
	
	if( this._player == null ){
		this._bootstrapPlayer();
	} else {
		if (null == this._currentBroadcast.get('video_id_at_provider')){
			Backbone.Events.trigger("playback:next");
		}
		else{
			this._playVideoWithId(this._currentBroadcast.get('video_id_at_provider'));
		}		
	}
};

YouTubeHTML5PlaybackManager.prototype.stop = function(){
	if( this._player ){ 
		this._player.stopVideo();
		this._playbackState.setPlaying(false);
	}
};

YouTubeHTML5PlaybackManager.prototype.playPause = function(){
	if( this._player ){ 
		this.getCurrentStatus() == "playing" ? this.pause() : this.play();
	}
};

YouTubeHTML5PlaybackManager.prototype.play = function(){
	if( this._player ){
		this._player.playVideo();
		this._playbackState.setPlaying(true);
		this._playbackState.setUserPaused(false);
	}
};

YouTubeHTML5PlaybackManager.prototype.pause = function(){
	if( this._player ){
		this._player.pauseVideo(); 
		this._playbackState.setPlaying(false);
		this._playbackState.setUserPaused(true);
	}
};

YouTubeHTML5PlaybackManager.prototype.getCurrentTime = function(){
	if( this._player ){ return this._player.getCurrentTime(); }
	else { return "?youtube?"; }
};

YouTubeHTML5PlaybackManager.prototype.getCurrentStatus = function(){
	if( this._player ){ 
		switch(this._player.getPlayerState()) {
			case 0:
				return "ended";
			case 1:
				return "playing";
			case 2:
				return "paused";
			case 3:
				return "buffering";
			case 5:
				return "cued";
		}
	}
	return null;
};


//---------------------------------------------------
// Optional methods
//---------------------------------------------------

YouTubeHTML5PlaybackManager.prototype.seekByPct = function(pct){
	this._player.seekTo( (pct * this._player.getDuration()), true);
};

YouTubeHTML5PlaybackManager.prototype.toggleMute = function(){
	if( !this._player ){ return; }
	
	//YT api .getVolume() and .isMuted() aren't returning correctly (as of 12/6/11 - ds)
	//see https://groups.google.com/group/youtube-api-gdata/browse_thread/thread/ea222226d5208285#
	//if( this._player.isMuted() ){ 
	if( this._playbackState.isMuted() ){
		this._player.unMute();
		this._playbackState.setMuted(false);
	} else { 
		this._player.mute();
		this._playbackState.setMuted(true);
	}
};

//---------------------------------------------------
// swap in/out
//---------------------------------------------------

YouTubeHTML5PlaybackManager.prototype.swapOutPlayer = function(){
	var self = this;
	this._swappedIn = false;
	
	if (Browser.isTV()){
  	// FOR BOXEE (and maybe other shitty computers/systems?): 
  	// remvoing player totally here
  	$("#"+this._divId).children().remove();
  	this._player = null;
  	window.YT = null;
  	//	  
	}
	
	this._stopMaintainingStatusBar();
	this._playbackState.reset();
	
	this._ensurePauseLoop = setInterval(function(){
		if (self._player && self._player.getPlayerState() !== 2){
			//not paused yet, let's try to pause and check again soon
			self._player.pauseVideo();
		} else {
			//yay, we're paused! can stop this madness now
			clearInterval(self._ensurePauseLoop);
			self._ensurePauseLoop = null; 
		}
	}, 100);
};

YouTubeHTML5PlaybackManager.prototype.swapInPlayer = function(){
	this._swappedIn = true;
	if( this._player != null){ this._playbackState.setPlayerLoaded(true); }
	
	//make sure we're not still trying to pause ourselves
	if (this._ensurePauseLoop !== null){
		clearInterval(this._ensurePauseLoop);
		this._ensurePauseLoop = null;
	}
	
	//get the playback state ready for us
	this._playbackState.setPlaybackManager(this);
	this._playbackState.setChromeless(true);
	if( this._player ){
		this._playbackState.setMuted(this._player.isMuted());
	}
	
	//and keep the status bar up to date
	this._maintainStatusBar();
	
	// SUPER HACK!  iOS doesn't allow auto- or programatic initial playback of video.  So the user *must* touch the
	// play button in the html5 iframe to start playback.  After initial playback, programatic playback is fine.
	// So... we disable our play button until the user first plays the video:
	if( Browser.isIos() && !this._userHasInitiatedPlayback ){ $("#player-controls-wrapper .play-pause.section").addClass("unsupported"); }
};


//---------------------------------------------------
// Private
//---------------------------------------------------

YouTubeHTML5PlaybackManager.prototype._storeBroadcastDuration = function(){
	if( this._player && (this._currentBroadcast.get('duration') <= 0.01) || typeof this._currentBroadcast.get('duration') !== "number" ){
		var dur = this._player.getDuration();
		if( typeof dur === "number" ){ this._currentBroadcast.set({'duration': dur}).save(); }
	}
};

YouTubeHTML5PlaybackManager.prototype._maintainStatusBar = function(){
	var self = this;
	
	this._statusBarMaintainer = setInterval(function(){
		if( self._player ){
			self._playbackState.setDuration(self._player.getDuration());
			self._playbackState.setCurrentTime(self._player.getCurrentTime());
			
			self._percentPlayed = parseFloat((self._player.getCurrentTime() / self._player.getDuration() * 100).toFixed(0));
			if (self._percentPlayed == App._openGraphPostingPercent  && !self._recordedProgress){
				self._recordedProgress = true;
				Backbone.Events.trigger("video:progress", self._percentPlayed);
			}
		}
	}, 250);
};

YouTubeHTML5PlaybackManager.prototype._stopMaintainingStatusBar = function(){
	if( this._statusBarMaintainer ){ clearInterval(this._statusBarMaintainer); }
};

YouTubeHTML5PlaybackManager.prototype._playVideoWithId = function(id){
	if( this._curVideoId == id ){
		this.play();
	}
	else {
		this._player.loadVideoById(id);
		this._player.setPlaybackQuality('default');
		this._curVideoId = id;
	}
};

YouTubeHTML5PlaybackManager.prototype._bootstrapPlayer = function(){	
	var tag = document.createElement('script');
	tag.src = "http://www.youtube.com/player_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
};


//---------------------------------------------------
// Internal events
//---------------------------------------------------

YouTubeHTML5PlaybackManager.prototype._onStateChange = function(event){
	this._playbackState.setBuffering(false);
	
	switch(event.data) {
		case 0: //YT.PlayerState.ENDED:
			// PAUSED and ENDED are reported at video end, but PAUSED is reported first which causes us to glitch and show paused screen :-[
			// Here we quickly hide it.  Not awesome, but may be the best hot-switch we can do w/o getting really hacky. FIXES #113
			this._playbackState.setUserPaused(false);
		
			//not settings playbackState playing to FALSE as that causes glitch
			//although it's *technically* true that we aren't playing back, we auto-advance to the next
			//video at this point, and flashing the paused screen is not what we want to do.
			Backbone.Events.trigger("video:ended", this._currentBroadcast);
		  break;
		case 1: //YT.PlayerState.PLAYING
			this._playbackState.setPlaying(true);
			Backbone.Events.trigger("playback:error", {playable: true}); //in case it was once unplayable
			this._storeBroadcastDuration();
			
			//we disabled the play button b/c iOS doesn't allow it at first, but now that things are rolling, we re-enable it
			if( !this._userHasInitiatedPlayback ){
				this._userHasInitiatedPlayback = true;
				$("#player-controls-wrapper .play-pause.section").removeClass("unsupported");
			}
			break;
		case 2: //YT.PlayerState.PAUSED
			this._playbackState.setPlaying(false);
			
			// if we're still the active player and the user clicks the YT player directly, it pauses.
			// that should be considered a user initiated pause. FIXES #38
			if( this._swappedIn ){ this._playbackState.setUserPaused(true); }
			break;
		case 3: //YT.PlayerState.BUFFERING
			this._playbackState.setBuffering(true);
			break;
		case 5: //YT.PlayerState.CUED
			//console.log("YT state CUED reported");
			break;
		default:
			//console.log("YT state **UNKNOWN** reported");
			break;
			//bit bucket
	}
};

YouTubeHTML5PlaybackManager.prototype._onError = function(event){
	// HACK: just going straight to the next video when an error is encountered
	switch(event.data) {
		case 2: // error code is broadcast when a request contains an invalid parameter
			Backbone.Events.trigger("playback:error");
			break;
		case 100: //YT video requested is not found:
			Backbone.Events.trigger("playback:error");
			break;
		case 101: //YT video requested does not allow playback in the embedded players
			Backbone.Events.trigger("playback:error");
			break;
		case 150: //same as 101
			Backbone.Events.trigger("playback:error");
			break;
		default:
			break;
	}
};

YouTubeHTML5PlaybackManager.prototype._onPlayerAPIReady = function(){
	var self = this;
	
	var unreadyPlayer = new YT.Player('youtube-player-holder', {
		width: '100%',
		height: '100%',
		playerVars: { 
			'rel': 0,
			'controls': 0,
			'disablekb': 1, //disable YouTubes keyboard controls (and keep ours)
			'enablejsapi': 1,
			'wmode': 'transparent',
			'autoplay': (self._shouldAutoplay ? 1 : 0),  // <-- this is ignored in iOS 4
			'showinfo': 0,
			'modestbranding': 1,
			'origin': window.location.host
		},
		videoId: this._currentBroadcast.get('video_id_at_provider'),
		events: {
			'onStateChange': function(e){ Backbone.Events.trigger("youtube:onStateChange", e); },
			'onError': function(e){ Backbone.Events.trigger("youtube:onError", e); },
			'onReady': function(e){ Backbone.Events.trigger("youtube:playerReady", e); }
	    }
	});
	
	this._curVideoId = this._currentBroadcast.get('video_id_at_provider');
};

YouTubeHTML5PlaybackManager.prototype._onPlayerReady = function(e){
	this._player = e.target;
	this._player.setVolume(100);
  this._playbackState.setPlayerLoaded(true);
};

//Global function called by the YouTube iframe player
function onYouTubePlayerAPIReady() {
	Backbone.Events.trigger("youtube:playerAPIReady");
}
