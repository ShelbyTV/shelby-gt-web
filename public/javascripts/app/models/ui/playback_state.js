// provides an interface between the current PlaybackManager and any objects that wish to
// respond to changes in the playback state (i.e. mute/unmute, current time, video duration, playing, buffering)
// and tracks what functionality each player supports (i.e. mute/unmute)
//
// N.B. This is not a "proper" Backbone model with a back end representation.  We're taking advantage of the model's event system.

window.libs.shelbyGT.PlaybackStateModel = Backbone.Model.extend({

	defaults: {
		"playbackManager": null,
		"chromeless": false,
		"currentTime": 0,
		"bufferTime": 0,
		"duration": 0,
		"supportsMute": true,
    "playerLoaded": false,
    "playing": false,
    "userPaused": false,
    "iframeOptions":null,
		"buffering": false,
		"playable":true
	},

	initialize: function(){
    this.playbackObserver();  
  },

  playbackObserver : function(){
    var invalidEvents = ['iframeOptions', 'bufferTime', 'playbackManager', 'duration', 'chromeless'];
    var self = this;

		Backbone.Events.bind('video:ended', function(){
			if (self.getIframeOptions()){
				self.postParentMessage({"ended":"true"});
			}
		});


		this.bind('change', function(stateChange){
			var changes = {};
			var changedAttrs = self.changedAttributes();
			if (self.getIframeOptions()){
				Object.keys(changedAttrs).forEach(function(k){
					if (invalidEvents.indexOf(k)===-1){
						changes[k] = changedAttrs[k];
					}
				});
				if (Object.keys(changes).length){
					self.postParentMessage(changes);
				}
			}
			else {
				if (Object.keys(changedAttrs)[0] === "playable"){
					// Listen to see if the broadcast is goes from playable to NOT playable
					if (changedAttrs.playable === false){
						App._videoShowView._currentPlaybackManager._currentBroadcast.set({'playable':changedAttrs.playable}).save();
					}
				}
			}
    });

  },

  postParentMessage : function(message){
    message = {id:this.getIframeOptions('container'), state:message};
    parent.postMessage(JSON.stringify(message), "*"); 
  },

	url: function() { return null; },
	reset: function(){
		this.set({
			playbackManager: this.defaults.playbackManager,
			chromeless: this.defaults.chromeless,
			currentTime: this.defaults.currentTime,
			bufferTime: this.defaults.bufferTime,
			duration: this.defaults.duration,
			supportsMute: this.defaults.supportsMute
		});
	},
	
	
	setPlaybackManager: function(pbm){ this.set({'playbackManager': pbm}); },
	getPlaybackManager: function(){ return this.get('playbackManager'); },

	setIframeOptions: function(options){ 
    this.set({'iframeOptions': options});
    Backbone.Events.trigger("iframe:renderOptions", options);
  },
	getIframeOptions: function(key){ return key ? this.get('iframeOptions')[key] : this.get('iframeOptions');},
	
	setChromeless: function(chromeless){ this.set({'chromeless': chromeless}); },
	isChromeless: function(){ return this.get('chromeless'); },
	
	setMuted: function(muted){ this.set({'muted': muted}); },
	isMuted: function(){ return this.get('muted'); },
	
	setPlayerLoaded: function(loaded){ this.set({'playerLoaded': loaded}); },
	isPlayerLoaded: function(){ return this.get('playerLoaded'); },

	//N.B. "playing" is defined in a very strict sense.  When a player is stopped to be swapped out, there is technically no video playing
	// and this is set accordingly.  Whenever a player reports paused/stopped, for whatever reason, this is set to false.
	// So... This should not be used if what you really care about is the user intentionally *pausing* playback.  See: userPaused
	setPlaying: function(playing){ 
		this.set({'playing': playing}); 
		if(playing){ this.setUserPaused(false); }
	},
	isPlaying: function(){ return this.get('playing'); },
	
	//if what you really care about is the user intentionally pausing the video, bind to change:userPaused
	setUserPaused: function(paused){ this.set({'userPaused': paused}); },
	isUserPaused: function(){ return this.get('userPaused'); },
	
	setBuffering: function(buffering){ this.set({'buffering': buffering}); },
	isBuffering: function(){ return this.get('buffering'); },
	
	setBufferTime: function(t){ this.set({'bufferTime': t}); },
	getBufferTime: function(){ return this.get('bufferTime'); },
	
	setCurrentTime: function(t){ this.set({'currentTime': t}); },
	getCurrentTime: function(){ return this.get('currentTime'); },
	
	setDuration: function(d){ this.set({'duration': d}); },
	getDuration: function(){ return this.get('duration'); },
	
	setPlayable: function(p){ this.set({'playable': p}); },
	isPlayable: function(){ return this.get('playable'); },
	
	setBuffering: function(b){ this.set({'buffering': b}); },
	isBuffering: function(){ return this.get('buffering'); },
		
	//functionality support
	setSupportsMute: function(s){ this.set({'supportsMute': s}); },
	supportsMute: function(){ return this.get('supportsMute'); }
	
});
