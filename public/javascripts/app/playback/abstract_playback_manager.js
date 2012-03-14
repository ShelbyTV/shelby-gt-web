var AbstractPlaybackManager = function(){
  this.options = {
    ogPostAfterPct: 15
  };
};

//------------------------------------------------------------
// Abstract methods that must be implemented
//------------------------------------------------------------

AbstractPlaybackManager.prototype.playVideo = function(video, shouldAutoplay){ alert("TODO: Play Video"); };

AbstractPlaybackManager.prototype.stop = function(){ alert("TODO: Stop Video"); };

AbstractPlaybackManager.prototype.playPause = function(){ alert("TODO: Play/Pause Video"); };

AbstractPlaybackManager.prototype.play = function(){ alert("TODO: Play Video"); };

AbstractPlaybackManager.prototype.pause = function(){ alert("TODO: Pause Video"); };

AbstractPlaybackManager.prototype.getCurrentTime = function(){ return "?abstract?";  };

//should return "playing", "buffering", "paused" or nil when there's no video/can't get status from API
AbstractPlaybackManager.prototype.getCurrentStatus = function(){ return null;  };

//------------------------------------------------------------
// Optional abstract methods
//------------------------------------------------------------

// When changing videos also changes players, there are times where the old player glitches and continues to play when we call stop()
// To prevent this, after hiding the player we inform it that it's been swapped out so it can robustly stop playback (if necessary)
AbstractPlaybackManager.prototype.swapOutPlayer = function(){ return null; };

// When the player is again about to be the active (and shown) player, we inform it so it can robustly start playback anew (if necessary)
AbstractPlaybackManager.prototype.swapInPlayer = function(){ return null; };

//if currently muted, unmute, and vice versa.  Should update the playback state object.
AbstractPlaybackManager.prototype.toggleMute = function(){ return null; };

//should seek to (pct*duration) in the currenct video.
AbstractPlaybackManager.prototype.seekByPct = function(pct){ return null; };

//we set the name of the player as a class on #main-pane (see .show/hide() below) so we can make layout adjustments per player
AbstractPlaybackManager.prototype._playerName = null;


//------------------------------------------------------------
// Common functionality
//------------------------------------------------------------

AbstractPlaybackManager.prototype.hide = function(){
	$("#"+this._divId).css('visibility', 'hidden').css('z-index', '-1');
	if( this._playerName ){ $("#main-pane").removeClass(this._playerName+"-playing"); }
};

AbstractPlaybackManager.prototype.show = function(){
	console.log('showing player div');
	$("#"+this._divId).css('visibility', 'visible').css('z-index', '0');
	if( this._playerName ){ $("#main-pane").addClass(this._playerName+"-playing"); }
};