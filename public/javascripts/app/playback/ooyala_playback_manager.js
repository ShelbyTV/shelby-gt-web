// Multiple providers user the ooyala player.
//
//Events bound (private):
//	ooyala:on_finish    [internal, triggered here]
//	ooyala:on_apiReady  [internal, triggered here]
//
//Events triggered:
//	video:ended

var OoyalaPlaybackManager = function(opts){
	var self = this;
	this._divId = opts.divId;
	this._playbackState = opts.playbackState;
	
	this._player = null;
	this._currentBroadcast = null;
	
	// for swapping player in and out
	this._ensurePauseLoop = null;
	
	//should autoplay on initial creation?
	this._shouldAutoplay = true;
	
	//this player is glitchy and may start playing when it shouldn't
	//we detect that condition and correct it
	this._swappedIn = false;
	
	//listen to private events
	Backbone.Events.bind("ooyala:onFinish", function() { self._onFinish(); });
	Backbone.Events.bind("ooyala:onApiReady", function(playerId) { self._onApiReady(playerId); });
	Backbone.Events.bind("ooyala:setCurrentTime", function(p) { self._setCurrentTime(p); });
	Backbone.Events.bind("ooyala:setDuration", function(p) { self._setDuration(p); });
	Backbone.Events.bind("ooyala:stateChanged", function(p) { self._stateChanged(p); });
};

OoyalaPlaybackManager.prototype = new AbstractPlaybackManager();


//---------------------------------------------------
// Required methods
//---------------------------------------------------

OoyalaPlaybackManager.prototype._playerName = "ooyala";

OoyalaPlaybackManager.prototype.playVideo = function(broadcast, shouldAutoplay){
	this._currentBroadcast = broadcast;
	this._shouldAutoplay = shouldAutoplay;
	this._recordedProgress = false;
	
	if( this._player == null ){
		this._bootstrapPlayer();
	} else {
		if (null === this._currentBroadcast.get('video_id_at_provider')){
			Backbone.Events.trigger("playback:next");
		} else {
			this._playVideoWithId(this._currentBroadcast.get('video_id_at_provider'));
		}
	}
};

OoyalaPlaybackManager.prototype.stop = function(){
	if( this._player ){ 
		this._player.pauseMovie(); 
	}
};

OoyalaPlaybackManager.prototype.playPause = function(){
	if( this._player ){ 
		//sadly, when an ad is playing, the player returns "paused" as the status.
		//N.B. this._player.pauseMovie() will still work though, so calling this.pause() will pause an ad.
		this.getCurrentStatus() == "playing" ? this.pause() : this.play();
	}
};

OoyalaPlaybackManager.prototype.play = function(){
	if( this._player ){ 
		this._player.playMovie();
		this._playbackState.setUserPaused(false);
	}
};

OoyalaPlaybackManager.prototype.pause = function(){
	if( this._player ){ 
		this._player.pauseMovie(); 
		this._playbackState.setUserPaused(true);
	}
};

OoyalaPlaybackManager.prototype.getCurrentTime = function(){
	if( this._player ){ return this._player.getPlayheadTime(); }
	else { return "?ooyala?"; }
};

OoyalaPlaybackManager.prototype.getCurrentStatus = function(){
	if( this._player){
		//seeing a bug here where getState() is not defined b/c this._player is an HTMLObjectElement and not the player
		switch(this._player.getState()) {
			case 'playing':
				return "playing";
			case 'paused':
				return "paused";
			case 'buffering':
				return "buffering";
		}
	}
	return null;
};


//---------------------------------------------------
// Optional methods
//---------------------------------------------------

OoyalaPlaybackManager.prototype.seekByPct = function(pct){
	this._player.setPlayheadTime( (pct * this._player.getTotalTime()) );
};

OoyalaPlaybackManager.prototype.toggleMute = function(){
	if( this._isMuted() ){ 
		this._unMute();
		this._playbackState.setMuted(false);
	} else { 
		this._mute();
		this._playbackState.setMuted(true);
	}
};

OoyalaPlaybackManager.prototype.setBcastDuration = function(duration){
	if (this._bcast_duration || this._currentBroadcast.get('duration') === 0){
		this._bcast_duration = duration;
		this._currentBroadcast.set({'duration':this._bcast_duration}).save();
	}
	return null;
};

//---------------------------------------------------
// swap in/out
//---------------------------------------------------

OoyalaPlaybackManager.prototype.swapOutPlayer = function(){
	this._swappedIn = false;
  
  if (Browser.isTV()){
  	// FOR BOXEE (and maybe other shitty computers/systems?): 
  	// remvoing player totally here
  	$("#"+this._divId).children().remove();
  	this._player = null;
  	//
	}
  
	this._playbackState.reset();
};

OoyalaPlaybackManager.prototype.swapInPlayer = function(){	
	this._swappedIn = true;
	if( this._player != null){ this._playbackState.setPlayerLoaded(true); }
	
	//get the playback state ready for us
	this._playbackState.setPlaybackManager(this);
	this._playbackState.setChromeless(true);
	if( this._player ){
		this._playbackState.setMuted(this._isMuted());
	}
};


//---------------------------------------------------
// Private
//---------------------------------------------------

OoyalaPlaybackManager.prototype._setCurrentTime = function(p){ 
	this._playbackState.setCurrentTime(p.playheadTime || p.newPlayheadTime); 
	
};

OoyalaPlaybackManager.prototype._setCurrentPercent = function(){
	this._percentPlayed = parseFloat((this._playbackState.getCurrentTime() / this._playbackState.getDuration() * 100).toFixed(0));
	if (this._percentPlayed == this.options.ogPostAfterPct  && !this._recordedProgress){
		this._recordedProgress = true;
		Backbone.Events.trigger("video:progress", this._percentPlayed);
	}
};

OoyalaPlaybackManager.prototype._setDuration = function(p){ 
	this._playbackState.setDuration(p.totalTime); 
	this.setBcastDuration(p.totalTime);
	this._curVideoDuration = p.totalTime;
};

OoyalaPlaybackManager.prototype._isMuted = function(){ return this._player && this._player.getVolume() === 0; };
OoyalaPlaybackManager.prototype._mute = function(){ this._player.setVolume(0.0); };
OoyalaPlaybackManager.prototype._unMute = function(){ this._player.setVolume(1.0); };

OoyalaPlaybackManager.prototype._playVideoWithId = function(id, autoPlay){
	if( this._player.getEmbedCode() == id ){
		this.play();
		this._playbackState.setDuration(this._curVideoDuration);
	}
	else {
		//need to set player params
		this._player.setQueryStringParameters({embedCode:id, autoplay:(autoPlay ? 1 : 0)});
	}
};


OoyalaPlaybackManager.prototype._bootstrapPlayer = function(){
	var src = "http://www.ooyala.com/player.js?playerContainerId="+this._divId+"&callback=receiveOoyalaEvent&playerId=ooyalaPlayer&wmode=transparent&embedCode="+this._currentBroadcast.get('video_id_at_provider')+"&version=2&autoplay="+(this._shouldAutoplay ? "1" : "0");
	
	//write to head, where script will be downloaded and run
	var tag = document.createElement('script');
	tag.src = src;
	
	//Firefox 3.6.x doesn't support document.head
	(document.head || document.getElementsByTagName( "head" )[0]).appendChild(tag);
};


//---------------------------------------------------
// Internal events
//---------------------------------------------------

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
			Backbone.Events.trigger("ooyala:stateChanged", params.state);
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
			Backbone.Events.trigger("ooyala:setDuration", params);
			break;
	}
}


OoyalaPlaybackManager.prototype._onFinish = function(){
	this._player.pauseMovie();
	Backbone.Events.trigger("video:ended", this._currentBroadcast);
	this._playbackState.setPlaying(false);
};

OoyalaPlaybackManager.prototype._onApiReady = function(playerId){
	//onApiReady is called everytime the embed changes, so only need to set _player the first time
	if( this._player === null ){ this._player = $("#"+playerId)[0]; }
  this._playbackState.setPlayerLoaded(true);
	this._playbackState.setDuration(this._player.getTotalTime());
};

//states passed by ooyala are [playing, paused, buffering, stopped] and i send [adStarted, adCompleted] 
//which we get from a different, specific callback
OoyalaPlaybackManager.prototype._stateChanged = function(state){
	this._playbackState.setBuffering(false);
	switch(state){
		case 'playing':
		case 'buffering':
			if( this._swappedIn ){
				this._playbackState.setPlaying(true);
				this._playbackState.setBuffering(true);
			} 
			else {
				// sadly, the player is in a bit of a glitchy state right now...
				this._player.pauseMovie(); 
			}
			break;
		case 'paused':
		case 'stopped':
			//when glitching (see above), we pause ourselves:  Okay to set internal _playing state, NOT external state playbackState.playing
			if( this._swappedIn ){ this._playbackState.setPlaying(false); }
			break;
		case 'adStarted':
			//don't play ad if we're not active...
			if( !this._swappedIn ){ this._player.pauseMovie(); }
			break;
		case 'adCompleted':
			//continues to video or next in Shelby, state will be handled elsewhere
			break;
	}
};

