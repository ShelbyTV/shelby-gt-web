/* 
Currently Collegehumor Flash player is implemented
docs: http://www.collegehumor.com/moogaloop/api.php

Events bound (private):
	collegehumor:player_ready
	collegehumor:state_change
	collegehumor:on_finish

Events triggered:
	video:ended
*/

var CollegehumorPlaybackManager = function(opts){
	var self = this;
	this._divId = opts.divId;
	this._playbackState = opts.playbackState;
	
	this._params = { allowScriptAccess: "always", wmode: "transparent" };
	
	this._player = null;
	this._currentBroadcast = null;
	
	//should autoplay on initial creation?
	this._shouldAutoplay = true;
	
	this._playing = false;
	this._isMuted = true;
	
	//the CH player is glitchy and may start playing when it shouldn't
	//we detect that condition and correct it
	this._swappedIn = false;
	
	//listen to private events
	Backbone.Events.bind("collegehumor:playerReady", function() { self._playerReady(); });
	Backbone.Events.bind("collegehumor:onFinish", function() { self._onFinish(); });
	Backbone.Events.bind("collegehumor:stateChange", function(s) { self._onStateChange(s); });
	Backbone.Events.bind("collegehumor:setCurrentTime", function(t) { self._setCurrentTime(t); });
	Backbone.Events.bind("collegehumor:setDuration", function(d) { self._setDuration(d); });
};

CollegehumorPlaybackManager.prototype = new AbstractPlaybackManager();


//---------------------------------------------------
// Required methods
//---------------------------------------------------

CollegehumorPlaybackManager.prototype._playerName = "college-humor";

CollegehumorPlaybackManager.prototype.playVideo = function(broadcast, shouldAutoplay){
	this._currentBroadcast = broadcast;
	this._shouldAutoplay = shouldAutoplay;
	this._recordedProgress = true;
	
	if( this._player === null ){
		this._bootstrapPlayer();
	} else {
		if (null === this._currentBroadcast.get('video_id_at_provider')){
			Backbone.Events.trigger("playback:next");
		}
		else{
			this._player.load_video(this._currentBroadcast.get('video_id_at_provider'));
		}
	}
};

CollegehumorPlaybackManager.prototype.stop = function(){
	if( this._player ){
		this._player.togglePlay(false);
		this._playing = false;
		if( this._swappedIn ){ this._playbackState.setPlaying(false); }
	} else {
		//the player is being swapped out, but will start playing anyway since it wasn't loaded yet...
		//Because this player is glitchy even during proper swap out, this player tracks its swapped in/out state
		//and will detect incorrect playback after swap out and fix it.
		//Therefore, we don't have to do anything special right now.
	}
};

CollegehumorPlaybackManager.prototype.playPause = function(){
	if( this._player ){ 
		this._playing ? this.pause() : this.play();
	}
};

CollegehumorPlaybackManager.prototype.play = function(){
	if( this._player ){
		this._player.togglePlay(true);
		if( this._swappedIn ){ 
			this._playbackState.setPlaying(true); 
			this._playbackState.setUserPaused(false);
		}
	}
};

CollegehumorPlaybackManager.prototype.pause = function(){
	if( this._player ){
		this._player.togglePlay(false); 
		if( this._swappedIn ){ 
			this._playbackState.setPlaying(false); 
			this._playbackState.setUserPaused(true);
		}
	}
};

CollegehumorPlaybackManager.prototype.getCurrentTime = function(){
	return (this._currentTime ? this._currentTime : "?collegehumor?");
};

CollegehumorPlaybackManager.prototype.getCurrentStatus = function(){
	if( this._player ){
		if( this._playing ){ return "playing"; } else { return "paused"; }
	}
	return null;
};

//---------------------------------------------------
// Optional methods
//---------------------------------------------------

CollegehumorPlaybackManager.prototype.seekByPct = function(pct){
	if(this._duration){ this._player.seekVideo( (pct * this._duration) ); }
};

CollegehumorPlaybackManager.prototype.toggleMute = function(){
	this._isMuted ? this._unMute() : this._mute();
};

CollegehumorPlaybackManager.prototype.setBcastDuration = function(duration){
	if (this._currentBroadcast.get('duration') === 0){
		this._currentBroadcast.set({'duration':duration}).save();
	}
	return null;
};


//---------------------------------------------------
// swap in/out
//---------------------------------------------------

CollegehumorPlaybackManager.prototype.swapOutPlayer = function(){
	this._swappedIn = false;

	if (Browser.isTV()){
  	// FOR BOXEE (and maybe other shitty computers/systems?): 
  	// remvoing player totally here
  	$("#"+this._divId).remove();
  	$("#embed-holder").append("<div id='"+this._divId+"'></div>");
  	this._player = null;
  	window.YT = null;
  	//	  
	}
	
	this._playbackState.reset();
};

CollegehumorPlaybackManager.prototype.swapInPlayer = function(){
	this._swappedIn = true;
	if( this._player != null){ this._playbackState.setPlayerLoaded(true); }
	
	//get the playback state ready for us
	this._playbackState.setPlaybackManager(this);
	this._playbackState.setChromeless(true);
	
	//CH BUG: they reset volume to 1 when a new video is loaded
	//and they don't update us when the video is loaded, so we need to keep our state in sync w/ them by unmuting ourselves
	if( this._player ){ this._unMute(); }
};


//---------------------------------------------------
// Private
//---------------------------------------------------

CollegehumorPlaybackManager.prototype._bootstrapPlayer = function(){
	var url = "http://www.collegehumor.com/moogaloop/moogaloop.swf?use_node_id=true&fullscreen=0&clip_id="+this._currentBroadcast.get('video_id_at_provider');
	swfobject.embedSWF(url, this._divId, "100%", "100%", "9.0.0", null, null, this._params);
};

CollegehumorPlaybackManager.prototype._mute = function(){
	if( this._player ){
		this._player.setVolume(0);
		this._playbackState.setMuted(true);
		this._isMuted = true;
	}
};

CollegehumorPlaybackManager.prototype._unMute = function(){
	if( this._player ){
		this._player.setVolume(1);
		this._playbackState.setMuted(false);
		this._isMuted = false;
	}
};

//---------------------------------------------------
// Internal events
//---------------------------------------------------

CollegehumorPlaybackManager.prototype._setCurrentTime = function(t){
	if( this._swappedIn ){
		this._currentTime = t;
		this._playbackState.setCurrentTime(t);
		this._setCurrentPercent();
	} else {
		//player is glitching hard, need to pause it
		this._player.togglePlay(false);
	}
};

CollegehumorPlaybackManager.prototype._setCurrentPercent = function(){
	this._percentPlayed = parseFloat((this._playbackState.getCurrentTime() / this._playbackState.getDuration() * 100).toFixed(0));
	if (this._percentPlayed == this.options.ogPostAfterPct  && !this._recordedProgress){
		this._recordedProgress = true;
		Backbone.Events.trigger("video:progress", this._percentPlayed);
	}
};

CollegehumorPlaybackManager.prototype._setDuration = function(d){
	this._duration = d;
	this._playbackState.setDuration(d);

	this.setBcastDuration(d);

};

CollegehumorPlaybackManager.prototype._onStateChange = function(newState){
	this._playbackState.setBuffering(false);
	switch(newState) {
		case 'ended': 
			// this marks the end of video, but an add plays after this, global callback function used is: detectEndVideo()
			break;
		case 'playing':
			if( this._swappedIn ){
				this._playing = true;
				this._playbackState.setPlaying(true);
			} 
			else {
				// sadly, the player is in a bit of a glitchy state right now...
				this._player.togglePlay(false);
			}
		  break;
		case 'pause':
			//when glitching (see above), we pause ourselves:  Okay to set internal _playing state, NOT external state playbackState.playing
			this._playing = false;
			if( this._swappedIn ){ this._playbackState.setPlaying(false); } 
			break;
		case 'buffering':
			this._playbackState.setBuffering(true);
			break;
		case 'seek':
			break;
		default:
			break;
			//bit bucket
	}
};

CollegehumorPlaybackManager.prototype._onFinish = function(){
	this._player.togglePlay(false);
	this._playing = false;
	
	//not settings playbackState playing to FALSE as that causes glitch
	//although it's *technically* true that we aren't playing back, we auto-advance to the next
	//video at this point, and flashing the paused screen is not what we want to do.

	Backbone.Events.trigger("video:ended", this._currentBroadcast);
};

CollegehumorPlaybackManager.prototype._playerReady = function(){
	this._player = $("#"+this._divId)[0];
  this._playbackState.setPlayerLoaded(true);

	if (this._shouldAutoplay){
		this._player.togglePlay(true);
		this._playing = true;
		this._playbackState.setPlaying(true);		
	} else {
		this._playing = false;
		this._playbackState.setPlaying(false);		
	}
	
	this._player.setVolume(1);
	this._isMuted = false;
};

//Global funcitons called by Collegehumor player
function CHPlayerReady(){ Backbone.Events.trigger("collegehumor:playerReady"); }

function getPlayerState(newState){ Backbone.Events.trigger("collegehumor:stateChange", newState); }

function detectEndVideo(){ Backbone.Events.trigger("video:ended", currentBcast); }

function getCurrentTime(t){ Backbone.Events.trigger("collegehumor:setCurrentTime", t); }

function getDuration(d){ Backbone.Events.trigger("collegehumor:setDuration", d); }
