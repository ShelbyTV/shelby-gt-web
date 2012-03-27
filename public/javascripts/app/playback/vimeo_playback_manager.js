//Currently Vimeo Flash player is implemented
//
//Events bound (private):
//  vimeo:player_ready
//  vimeo:on_finish
//
//Events triggered:
//  video:ended

var VimeoPlaybackManager = function(opts){
	var self = this;
	_.extend(this.options, opts);
	this._divId = opts.divId;
	this._playbackState = opts.playbackState;
	
	this._params = { allowScriptAccess: "always", wmode: "transparent" };
	
	this._player = null;
	this._video = null;
	this._playing = false;
	this._globalCallbackCalled = false;
	
	//should autoplay on initial creation?
	this._shouldAutoplay = true;
	
	//this player is glitchy and may start playing when it shouldn't
	//we detect that condition and correct it
	this._swappedIn = false;
	
	//listen to private events
	Backbone.Events.bind("vimeo:playerLoaded", function() { self._playerLoaded(); });
	Backbone.Events.bind("vimeo:onFinish", function() { self._onFinish(); });
	Backbone.Events.bind("vimeo:onPlay", function() { self._onPlay(); });
	Backbone.Events.bind("vimeo:onPause", function() { self._onPause(); });
	Backbone.Events.bind("vimeo:onReady", function() { self._onReady(); });
	Backbone.Events.bind("vimeo:updateCurrentTime", function(s) { self._updateCurrentTime(s); });
	Backbone.Events.bind("vimeo:updateBufferTime", function(p) { self._updateBufferTime(p); });
};

VimeoPlaybackManager.prototype = new AbstractPlaybackManager();


//---------------------------------------------------
// Required methods
//---------------------------------------------------

VimeoPlaybackManager.prototype._playerName = "vimeo";

VimeoPlaybackManager.prototype.playVideo = function(video, shouldAutoplay){
	this._video = video;
	this._shouldAutoplay = shouldAutoplay;
	this._recordedProgress = false;
	
	//check if broadcast if currently playable
	// there is some issue with this check on the boxee
	if (!Browser.isBoxee()) { this._playableCheck(); }
	
	if( this._player == null ){
		this._bootstrapPlayer();
	} else {
		if (null == this._video.get('provider_id')){
			Backbone.Events.trigger("playback:next");
		} else {
			this._playVideoWithId(this._video.get('provider_id'));
		}
	}
};

VimeoPlaybackManager.prototype.stop = function(){
	if( this._player ){
		this._player.api_pause(); 
		this._playing = false;
		this._playbackState.setPlaying(false);
	}
};

VimeoPlaybackManager.prototype.playPause = function(){
	if( this._player ){ 
		this.getCurrentStatus() == "playing" ? this.pause() : this.play();
	}
};

VimeoPlaybackManager.prototype.play = function(){
	if( this._player ){
		this._player.api_play(); 
		this._playing = true;
		this._playbackState.setPlaying(true);
		this._playbackState.setUserPaused(false);
	}
};

VimeoPlaybackManager.prototype.pause = function(){
	if( this._player ){
		this._player.api_pause(); 
		this._playing = false;
		this._playbackState.setPlaying(false);
		this._playbackState.setUserPaused(true);
	}
};

VimeoPlaybackManager.prototype.getCurrentTime = function(){
	if( this._player ){ return this._player.api_getCurrentTime(); }
	else { return "?vimeo?"; }
};

VimeoPlaybackManager.prototype.getCurrentStatus = function(){
	if( this._player ){
		if( this._playing ){ return "playing"; } else { return "paused"; }
	}
	return null;
};


//---------------------------------------------------
// Optional methods
//---------------------------------------------------

VimeoPlaybackManager.prototype.seekByPct = function(pct){
	this._player.api_seek( (pct * this._player.api_getDuration()) );
};

VimeoPlaybackManager.prototype.toggleMute = function(){
	if( this._isMuted() ){ 
		this._unMute();
		this._playbackState.setMuted(false);
	} else { 
		this._mute();
		this._playbackState.setMuted(true);
	}
};

VimeoPlaybackManager.prototype.setBcastDuration = function(duration){
	if (this._video_duration || this._video.get('duration') === 0){
		this._video_duration = duration;
		// this._video.save({'duration':this._video_duration});
	}
	return null;
};

//---------------------------------------------------
// swap in/out
//---------------------------------------------------

VimeoPlaybackManager.prototype.swapOutPlayer = function(){
	this._swappedIn = false;
	
	if (Browser.isTV()){
  	// FOR BOXEE (and maybe other shitty computers/systems?): 
  	// remvoing player totally here
  	$("#"+this._divId).remove();
  	$("#embed-holder").append("<div id='"+this._divId+"'></div>");
  	this._player = null;
  	//	  
	}
	
	this._playbackState.reset();
	
	if (this._playing && this._player){
		this._player.api_pause();
		this._playing = false;
	} else {
		this._playing = false;
	}
};

VimeoPlaybackManager.prototype.swapInPlayer = function(){	
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

VimeoPlaybackManager.prototype._updateCurrentTime = function(s){ 
	this._playbackState.setCurrentTime(s);
	this._updatePercentPlayed();
};

VimeoPlaybackManager.prototype._updateBufferTime = function(p){ this._playbackState.setBufferTime(p.duration * p.decimal); };

VimeoPlaybackManager.prototype._updatePercentPlayed = function() {
	this._percentPlayed = parseFloat((this._playbackState.getCurrentTime() / this._playbackState.getDuration() * 100).toFixed(0));
	if (this._percentPlayed == this.options.ogPostAfterPct  && !this._recordedProgress){
		this._recordedProgress = true;
		Backbone.Events.trigger("video:progress", this._percentPlayed);
	}
};

VimeoPlaybackManager.prototype._bootstrapPlayer = function(){
	var flashvars = {
		clip_id: this._video.get('provider_id'),
		show_portrait: 0,
		show_byline: 0,
		show_title: 0,
		fullscreen: 0,
		js_api: 1, // required in order to use the Javascript API
		js_onLoad: 'vimeo_player_loaded'
	};
	var attributes = {};
	
	swfobject.embedSWF("http://vimeo.com/moogaloop.swf", this._divId, "100%", "100%", "9.0.0","expressInstall.swf", flashvars, this._params);
	
	this._curVideoId = this._video.get('provider_id');
};

VimeoPlaybackManager.prototype._isMuted = function(){
	if( this._player ){ return this._player.api_getVolume() == 0; }
	return false;
};

VimeoPlaybackManager.prototype._mute = function(){ if(this._player){ this._player.api_setVolume(0); } };

VimeoPlaybackManager.prototype._unMute = function(){ if(this._player){ this._player.api_setVolume(100); } };

VimeoPlaybackManager.prototype._playVideoWithId = function(id){
	if( this._curVideoId == id){
		this.play();
	} else {
		//need to actually load new video
		this._player.api_loadVideo(id);
		this._curVideoId = id;
	}
};

VimeoPlaybackManager.prototype._playableCheck = function(){
	var self = this;
	// make request to vimeo api to see if video is available, record if a video is returned
	$.ajax({
		url:"http://vimeo.com/api/v2/video/"+ this._video.get('provider_id') +".json",
		dataType:"jsonp",
		success: 
			function(s){
				if (s.length === 0){ Backbone.Events.trigger("playback:error", {playable: false}); }
				else { Backbone.Events.trigger("playback:error", {playable: true}); }
			},
		error:
			function(s){
				Backbone.Events.trigger("playback:error", {playable: true});
			},
		complete:
			function(s){
				if (s.statusText === "timeout"){ Backbone.Events.trigger("playback:error", {playable: true}); }
				else if (s.statusText === "error"){ Backbone.Events.trigger("playback:error", {playable: false}); }
			},
		timeout : 2000
	});
	
};

//---------------------------------------------------
// Internal events
//---------------------------------------------------

VimeoPlaybackManager.prototype._onPlay = function(){ 
	if( this._swappedIn ){
		self._playing = true;
		this._playbackState.setPlaying(true);
		this._playbackState.setDuration(this._player.api_getDuration());
	} else {
		// sadly, the player is in a bit of a glitchy state right now...
		this._player.api_pause();
	}
};

VimeoPlaybackManager.prototype._onPause = function(){ 
	if( this._swappedIn ){ 
		//when glitching (see above), we pause ourselves:  Okay to set internal _playing state, NOT external state playbackState.playing
		//also, need to set user paused if we're swapped in, b/c it's not the programmatic one (fixes #76)
		this._playbackState.setPlaying(false); 
		this._playbackState.setUserPaused(true);
	}
	this._playing = false; 
};

VimeoPlaybackManager.prototype._onReady = function(){
	//auto play is not a config option, need to press play meow...
	if( this._shouldAutoplay ){ this.play(); }
		
	this._player.api_setVolume(100);
	
	this._playbackState.setPlayerLoaded(true);

	this._globalCallbackCalled = true;
};

VimeoPlaybackManager.prototype._onFinish = function(){
	this._player.api_pause();
	this._playing = false;
	Backbone.Events.trigger("video:ended", this._video);
};

VimeoPlaybackManager.prototype._playerLoaded = function(){
	this._player = $("#"+this._divId)[0];	
	this._player.api_addEventListener('onFinish',   "function(){ Backbone.Events.trigger('vimeo:onFinish') }");
	this._player.api_addEventListener('onPlay',   "function(){ Backbone.Events.trigger('vimeo:onPlay') }");
	this._player.api_addEventListener('onPause',   "function(){ Backbone.Events.trigger('vimeo:onPause') }");
	this._player.api_addEventListener('playProgress',   "function(s){ Backbone.Events.trigger('vimeo:updateCurrentTime', s) }");
	this._player.api_addEventListener('seek',   "function(s){ Backbone.Events.trigger('vimeo:updateCurrentTime', s) }");
	this._player.api_addEventListener('loadProgress',   "function(p){ Backbone.Events.trigger('vimeo:updateBufferTime', p) }");	
	this._player.api_addEventListener('onReady', Backbone.Events.trigger('vimeo:onReady'));
};

//Global funciton called by Vimeo player
function vimeo_player_loaded(playerId) {
	Backbone.Events.trigger("vimeo:playerLoaded");
}
