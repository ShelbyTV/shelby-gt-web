//Currently Bliptv Flash player is implemented
// api docs: http://wiki.blip.tv/index.php/Showplayer
//
//Events bound (private):
//	bliptv:player_ready
//	bliptv:on_finish
//
//Events triggered:
//	video:ended

var BliptvPlaybackManager = function(opts){
	var self = this;
	this._divId = opts.divId;
	this._playbackState = opts.playbackState;
	
	this._player = null;
	this._currentBroadcast = null;
	this._currentTime = null;
	
	//should autoplay on initial creation?
	this._shouldAutoplay = true;
	
	//this player is glitchy and may start playing when it shouldn't
	//we detect that condition and correct it
	this._swappedIn = false;
	
	//listen to private events
	Backbone.Events.bind("bliptv:playerReady", function() { self._playerReady(); });
	Backbone.Events.bind("bliptv:onFinish", function() { self._onFinish(); });
	Backbone.Events.bind("bliptv:updateCurrentTime", function(t) { self._updateCurrentTime(t); });
	Backbone.Events.bind("bliptv:stateChange", function(s) { self._onStateChange(s); });
};

BliptvPlaybackManager.prototype = new AbstractPlaybackManager();


//---------------------------------------------------
// Required methods
//---------------------------------------------------

BliptvPlaybackManager.prototype._playerName = "blip-tv";

BliptvPlaybackManager.prototype.playVideo = function(broadcast, shouldAutoplay){
	this._currentBroadcast = broadcast;
	this._shouldAutoplay = shouldAutoplay;
	this._recordedProgress = false;
	
	if (null === this._currentBroadcast.get('video_id_at_provider')){
		Backbone.Events.trigger("playback:next");
	}	else {
		this._bootstrapPlayer();
	}
};


BliptvPlaybackManager.prototype.stop = function(){
	if( this._player ){
		// solves problem of ad plaing once leaving this video
		$('#'+this._divId).empty();
		this._playbackState.setPlaying(false);
	}
};

BliptvPlaybackManager.prototype.playPause = function(){
	if( this._player ){
		this._player.getCurrentState() === "playing" ? this.pause() : this.play();
	}
};

BliptvPlaybackManager.prototype.play = function(){
	if( this._player ){
		this._player.sendEvent('play');
		this._playbackState.setPlaying(true);
		this._playbackState.setUserPaused(false);
	}
};

BliptvPlaybackManager.prototype.pause = function(){
	if( this._player ){
		this._player.sendEvent('pause');
		this._playbackState.setPlaying(false);
		this._playbackState.setUserPaused(true);
	}
};

BliptvPlaybackManager.prototype.getCurrentTime = function(){
	return this._currentTime ? this._currentTime : "?bliptv?";
};

BliptvPlaybackManager.prototype.getCurrentStatus = function(){
	if( this._player ){ 
		switch(this._player.getCurrentState()) {
			case 'complete':
				return "ended";
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

BliptvPlaybackManager.prototype.seekByPct = function(pct){
	this._player.sendEvent('seek', (pct * this._playbackState.getDuration()) );
};

BliptvPlaybackManager.prototype.toggleMute = function(){
	if( this._playbackState.isMuted() ){ 
		this._player.sendEvent('volume', 1.0);
		this._playbackState.setMuted(false);
	} else { 
		this._player.sendEvent('mute');
		this._playbackState.setMuted(true);
	}
};

BliptvPlaybackManager.prototype.setBcastDuration = function(duration){
	if (this._currentBroadcast.get('duration') === 0 || this._bcast_duration){
		this._bcast_duration = duration;
		this._currentBroadcast.set({'duration':this._bcast_duration}).save();
	}
	return null;
};


//---------------------------------------------------
// swap in/out
//---------------------------------------------------

BliptvPlaybackManager.prototype.swapOutPlayer = function(){
	this._swappedIn = false;
	
	this._playbackState.reset();
	
	//need to bootstrap this player every time...
	$(this._player).remove();
	this._player = null;
};

BliptvPlaybackManager.prototype.swapInPlayer = function(){
	this._swappedIn = true;
	if( this._player != null){ this._playbackState.setPlayerLoaded(true); }
	
	//get the playback state ready for us
	this._playbackState.setPlaybackManager(this);
	this._playbackState.setChromeless(true);
	this._playbackState.setMuted(false);
	if( this._player ){ this._player.sendEvent('volume', 1.0); }
};


//---------------------------------------------------
// Private
//---------------------------------------------------


BliptvPlaybackManager.prototype._bootstrapPlayer = function(){
	var self = this;
	
	//1) embed the player
	var url = 'http://blip.tv/play/'+this._currentBroadcast.get('video_id_at_provider')+'?enablejs=true&autostart='+this._shouldAutoplay+'&showsharebutton=false&showfsbutton=false&chromeless=true&preferredRole=Blip%20HD%20720';
	
	this._embedId = 'blip-player';

	$('<embed>').attr('type','application/x-shockwave-flash').attr('id', this._embedId)
				.attr('height','100%')
				.attr('width','100%')
				.attr('allowfullscreen','true')
				.attr('allowscriptaccess','always')
				.attr('src',url)
				.attr('wmode','transparent')
				.attr('chromeless', 'true')
				.attr('pluginspage','http://www.macromedia.com/go/getflashplayer')
				.appendTo($("#"+this._divId));
	$("#"+this._divId).width('100%').height('100%');

	this._player = $("#"+this._divId +" embed")[0];	
	
	//2) get metadata (just need duration) about the video
	this._updateViaMetadata();
};

// The BlipTV player does not give us or provide duration, so we have to get it another way.
// We are using their JSONp API to get metadata about the currently playing video and pull duration from that
// This isn't heavily tested quite yet...
BliptvPlaybackManager.prototype._updateViaMetadata = function(){
	var self = this;
	
	var metadataUrl = "http://blip.tv/players/episode/"+this._currentBroadcast.get('video_id_at_provider')+"?skin=json&version=2&callback=?";
	$.getJSON(metadataUrl, function(d){
		try{ 
			self._playbackState.setDuration(d[0].Post.media.duration);
			
			self.setBcastDuration(d[0].Post.media.duration);
		}catch(e){}
	});

};


//---------------------------------------------------
// Internal events
//---------------------------------------------------
BliptvPlaybackManager.prototype._onStateChange = function(newState){
	switch(newState) {
		case 'playing':
			this._playbackState.setBuffering(false);
			if( this._swappedIn ){
				this._playing = true;
				this._playbackState.setPlaying(true);
			} else {
				// sadly, the player is in a bit of a glitchy state right now...
				this._player.togglePlay(false);
			}
		  break;
		case 'paused':
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

BliptvPlaybackManager.prototype._onFinish = function(){
	$('#'+this._divId).empty();
	Backbone.Events.trigger("video:ended", this._currentBroadcast);
};

BliptvPlaybackManager.prototype._updateCurrentTime = function(t){
	//we don't get a true "playing" event... can we hack it by setting it here, or will this fuck up w/ pausing?
	if (this._player.getCurrentState() === "playing") { this._playbackState.setPlaying(true); }
	
	this._currentTime = t;
	this._playbackState.setCurrentTime(t);
	this._setCurrentPercent();
};

BliptvPlaybackManager.prototype._setCurrentPercent = function(){
	this._percentPlayed = parseFloat((this._playbackState.getCurrentTime() / this._playbackState.getDuration() * 100).toFixed(0));
	if (this._percentPlayed == App._openGraphPostingPercent  && !this._recordedProgress){
		this._recordedProgress = true;
		Backbone.Events.trigger("video:progress", this._percentPlayed);
	}
};

BliptvPlaybackManager.prototype._playerReady = function(){
	//register specific callbacks we care about
	this._player.addJScallback('complete',   'function(){Backbone.Events.trigger("bliptv:onFinish");}');	
	this._player.addJScallback('current_time_change',   'function(t){Backbone.Events.trigger("bliptv:updateCurrentTime", t);}');	
	this._player.addJScallback('player_state_change',   'function(s){Backbone.Events.trigger("bliptv:stateChange", s)}');	
  this._playbackState.setPlayerLoaded(true);
};

//Global function called by Bliptv player
function getUpdate(changeType, param1, param2){
	// Blip is not recognizing this as a callback at first for some reason so it is called here first so that we esure we get the player state
	if( changeType === "player_state_change") { Backbone.Events.trigger("bliptv:stateChange", param1); }
	if ( changeType === "ad_displaying") { App._playbackState.setPlaying(true); }
	if( changeType === "playback_start" || changeType === "ad_initialized" ){ Backbone.Events.trigger("bliptv:playerReady"); }
}
