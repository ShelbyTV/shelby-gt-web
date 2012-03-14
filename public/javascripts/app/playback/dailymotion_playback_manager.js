//Currently DailyMotion Flash player is implemented
//
//Events bound:
//
//Events triggered:
//	video:ended

var DailyMotionPlaybackManager = function(opts){
	var self = this;
	this._divId = opts.divId;
	this._playbackState = opts.playbackState;
	
	this._params = { allowScriptAccess: "always", wmode: "transparent" };
	this._attrs = { id: this._divId };
		
	this._player = null;
	this._currentBroadcast = null;

	// for swapping player in and out
	self._ensurePauseLoop = null;
	
	//should autoplay on initial creation?
	this._shouldAutoplay = true;
	
	//listen to private events
	Backbone.Events.bind("dailymotion:playerReady", function(id) { self._playerReady(id); });
	Backbone.Events.bind("dailymotion:onStateChange", function(s) { self._onStateChange(s); });
	Backbone.Events.bind("dailymotion:onVideoProgress", function(p) { self._onVideoProgress(p); });
	Backbone.Events.bind("dailymotion:onVideoMetadata", function(m) { self._onVideoMetadata(m); });
};

DailyMotionPlaybackManager.prototype = new AbstractPlaybackManager();


//---------------------------------------------------
// Required methods
//---------------------------------------------------

DailyMotionPlaybackManager.prototype._playerName = "daily-motion";

DailyMotionPlaybackManager.prototype.playVideo = function(broadcast, shouldAutoplay){
	// loading bootstrap regardless of whether player has been loadded before 
	// solves problem of advert staying playing once leaving this video
	this._currentBroadcast = broadcast;
	this._shouldAutoplay = shouldAutoplay;
	this._recordedProgress = false;
	
	if (null === this._currentBroadcast.get('video_id_at_provider')){
		Backbone.Events.trigger("playback:next");
	} else {
		this._bootstrapPlayer();
	}
};

DailyMotionPlaybackManager.prototype.stop = function(){
	if( this._player ){ 
		// removing the whole player on "stop"
		// solves problem of advert staying playing once leaving this video
		$('#'+this._divId).remove();
		$('#embed-holder').append('<div id="dailymotion-player-holder"></div>');
		this._player = null;
		this._playbackState.setPlaying(false);
	}
};

DailyMotionPlaybackManager.prototype.playPause = function(){
	if( this._player ){ 
		this.getCurrentStatus() === "playing" ? this.pause() : this.play();
	}
};

DailyMotionPlaybackManager.prototype.play = function(){
	if( this._player ){ 
		if (this.getCurrentStatus() === "unstarted"){
			//when autoplay is off, dailymotion player won't .playVideo after initial load. You need to loadVideoById to actually play the video...
			this._player.loadVideoById(this._currentBroadcast.get('video_id_at_provider'));
		}  else {
			this._player.playVideo();
		}
		this._playbackState.setPlaying(true);
		this._playbackState.setUserPaused(false);
	}
};

DailyMotionPlaybackManager.prototype.pause = function(){
	if( this._player ){ 
		this._player.pauseVideo();
		this._playbackState.setPlaying(false);
		this._playbackState.setUserPaused(true);
	}
};

DailyMotionPlaybackManager.prototype.getCurrentTime = function(){
	if( this._player ){ return this._player.getCurrentTime(); }
	else { return "?dailymotion?"; }
};

DailyMotionPlaybackManager.prototype.getCurrentStatus = function(){
	if( this._player ){ 
		switch(this._player.getPlayerState()) {
			case -1:
				return "unstarted";
			case 0:
				return "ended";
			case 1:
				return "playing";
			case 2:
				return "paused";
		}
	}
	return null;
};


//---------------------------------------------------
// Optional methods
//---------------------------------------------------

DailyMotionPlaybackManager.prototype.seekByPct = function(pct){
	this._player.seekTo( (pct * this._player.getDuration()) );
};

DailyMotionPlaybackManager.prototype.toggleMute = function(){
	if( this._player.isMuted() ){ 
		this._player.unMute();
		this._playbackState.setMuted(false);
	} else { 
		this._player.mute();
		this._playbackState.setMuted(true);
	}
};

DailyMotionPlaybackManager.prototype.setBcastDuration = function(duration){
	consol.log('duration: ', duration);
	if (this._bcast_duration || this._currentBroadcast.get('duration') === 0){
		this._bcast_duration = duration;
		this._currentBroadcast.set({'duration':this._bcast_duration}).save();
	}
	return null;
};



//---------------------------------------------------
// swap in/out
//---------------------------------------------------

DailyMotionPlaybackManager.prototype.swapOutPlayer = function(){
	this._playbackState.reset();
	
	//need to bootstrap this player every time...
	$(this._player).remove();
	this._player = null;
};

DailyMotionPlaybackManager.prototype.swapInPlayer = function(){	
	if( this._player != null){ this._playbackState.setPlayerLoaded(true); }
	
	//get the playback state ready for us
	this._playbackState.setPlaybackManager(this);
	this._playbackState.setChromeless(true);
	if( this._player ){
		this._playbackState.setMuted(this._player.isMuted());
	}
};


//---------------------------------------------------
// Private
//---------------------------------------------------

DailyMotionPlaybackManager.prototype._onVideoProgress = function(p){ 
	//console.log("daily motion video progress", p);
	this._playbackState.setCurrentTime(p.mediaTime);
	this._setCurrentPercent();
};

DailyMotionPlaybackManager.prototype._setCurrentPercent = function(){
	this._percentPlayed = parseFloat((this._playbackState.getCurrentTime() / this._playbackState.getDuration() * 100).toFixed(0));
	if (this._percentPlayed == App._openGraphPostingPercent  && !this._recordedProgress){
		this._recordedProgress = true;
		Backbone.Events.trigger("video:progress", this._percentPlayed);
	}
};

DailyMotionPlaybackManager.prototype._onVideoMetadata = function(m){ 
	this._playbackState.setDuration(m.videoduration.slice(0,5) || m.videoDuration.slice(0,5)); 
	this.setBcastDuration(m.videoDuration.slice(0,5));
};

DailyMotionPlaybackManager.prototype._bootstrapPlayer = function(){
	var url = "http://www.dailymotion.com/swf/"+this._currentBroadcast.get('video_id_at_provider')+"&enableApi=1&autoPlay="+(this._shouldAutoplay ? "1" : "0")+"&chromeless=1&playerapiid="+this._divId ;
	swfobject.embedSWF(url, this._divId, "100%", "100%", "9.0.0", null, null, this._params, this._attrs);
};


//---------------------------------------------------
// Internal events
//---------------------------------------------------

DailyMotionPlaybackManager.prototype._onStateChange = function(newState){
	this._playbackState.setBuffering(false);
	switch(newState) {
		case 0: //DM.PlayerState.ENDED:
			Backbone.Events.trigger("video:ended", this._currentBroadcast);
			break;
		case 1: //DM.PlayerState.PLAYING
			this._playbackState.setPlaying(true);
			break;
		case 2: //DM.PlayerState.PAUSED
			this._playbackState.setPlaying(false);
			break;
		case 3: //DM.PlayerState.BUFFERING
			this._playbackState.setBuffering(true);
			break;
		case 5: //DM.PlayerState.CUED
			//console.log("DM state CUED reported");
			break;
		default:
			//console.log("DM state **UNKNOWN** reported");
			break;
			//bit bucket
	}
};

DailyMotionPlaybackManager.prototype._playerReady = function(playerId){
	this._player = $("#"+playerId)[0];	
	this._player.addEventListener("onStateChange", "function(s){ Backbone.Events.trigger('dailymotion:onStateChange', s) }");
	this._player.addEventListener("onVideoProgress", "function(p){ Backbone.Events.trigger('dailymotion:onVideoProgress', p) }");
	this._player.addEventListener("onVideoMetadata", "function(m){ Backbone.Events.trigger('dailymotion:onVideoMetadata', m) }");
  this._playbackState.setPlayerLoaded(true);
};

//Global funciton called by DailyMotion player
function onDailymotionPlayerReady(playerId) {
	Backbone.Events.trigger("dailymotion:playerReady", playerId);
}
