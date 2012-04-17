libs.shelbyGT.BlipTvVideoPlayerView = Support.CompositeView.extend({

	id: 'bliptv-player-holder',
	
	_video: null,
	_player: null,
	
	_playbackState: null,
	
	playerState: null,
		
	initialize: function(opts){
		var self = this;
		this._playbackState = opts.playbackState;
		
		this.playerState = new libs.shelbyGT.PlayerStateModel({
			supportsChromeless: true,
			supportsMute: true,
			supportsVolume: true
			});
		
			//listen to private events
			Backbone.Events.bind("bliptv:playerReady", this._playerReady, this);
			Backbone.Events.bind("bliptv:onFinish", this._onFinish, this);
			Backbone.Events.bind("bliptv:updateCurrentTime", function(t) { self._updateCurrentTime(t); });
			Backbone.Events.bind("bliptv:stateChange", function(s) { self._onStateChange(s); });
	},
	
	//NB: overriding leave b/c we don't usually tear down
	leave: function(){
		//BlipTv gets torn down every time, don't need to _cleanup tho (those bindings are still good, don't want to re-bind)
		this.pause();
		
		//remove will leave us w/o a holder div, so we clean up after it...
		var container = this.$el.parent();
		this.$el.remove();
		container.append('<div id="'+this.id+'"></div>');
		
		this._player = null;
		this.playerState.set({playerLoaded:false});
		this.playerState.set({visible:false});
	},
	
	_cleanup: function(){
		Backbone.Events.unbind("bliptv:playerReady", this._playerReady, this);
		Backbone.Events.unbind("bliptv:onFinish", this._onFinish, this);
		Backbone.Events.unbind("bliptv:updateCurrentTime");
		Backbone.Events.unbind("bliptv:stateChange");
	},
	
	render: function(container, video){
		if( !this.playerState.get('playerLoaded') ){
		  this._video = video;
			this._bootstrapPlayer();
		}
		//this player is torn down if we've flipped to another player, no way to just flip it back visible
	},
	
	playVideo: function(video){
		//this player only loads video on bootstrap, which it may have just done
		//but if our video is swapped w/o changing players, we won't render, so have to do tear down and bootstrap here
		
		if( video !== this._video && this.playerState.get('playerLoaded') ){
			this._video = video;
			
			//this player needs to be torn down every time
			this.leave();
			this._bootstrapPlayer();
		}
	},

	play: function(){
		if( this._player ){
			this._player.sendEvent('play');
		}
	},

	pause: function(){
		if( this._player ){
			this._player.sendEvent('pause'); 
		}
	},
	
	//expects pct to be [0.0, 1.0]
	seekByPct: function(pct){
		if( this._player && this.playerState.get('duration') ){ 
			this._player.sendEvent('seek', (pct * this.playerState.get('duration')) ); 
		}
	},
	
	mute: function(){
		if( this._player ){
			this._player.sendEvent('volume', 0.0);
			this.playerState.set({muted: true});
		}
	},
	
	unMute: function(){
		if( this._player ){
			this._player.sendEvent('volume', 1.0);
			this.playerState.set({muted: false});
		}
	},
	
	//expects pct to be [0.0, 1.0]
	setVolume: function(pct){
		if( this._player ){
			this._player.sendEvent('volume', pct);
			this.playerState.set({volume: pct});
		}
	},
	
	//---------------------------------------------------
	// Private
	//---------------------------------------------------
	
	_updateDuration: function(){
		if( this._player ){	this.playerState.set({duration:this._player.getDuration()}); }
	},
	
	// The BlipTV player does not give us or provide duration, so we have to get it another way.
	// We are using their JSONp API to get metadata about the currently playing video and pull duration from that
	// This isn't heavily tested quite yet...
	_updateViaMetadata: function(){
		var self = this;

		var metadataUrl = "http://blip.tv/players/episode/"+this._video.get('provider_id')+"?skin=json&version=2&callback=?";
		$.getJSON(metadataUrl, function(d){
			try{ 
				self.playerState.set({duration:d[0].Post.media.duration});
			}catch(e){}
		});

	},
	
	//---------------------------------------------------
	// Internal events
	//---------------------------------------------------
	
	_onFinish: function(){
		this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.ended});
	},

	_updateCurrentTime: function(t){
		this.playerState.set({currentTime:t});
	},
	
	_onStateChange: function(newState){
		switch(newState) {
			case 'playing':
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.playing});
				break;
			case 'paused':
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.paused});
				break;
			case 'buffering':
				this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.buffering});
				break;
			case 'seek':
				break;
			default:
				break;
				//bit bucket
		}
	},
	
	_playerReady: function(){
		//BlipTv replaces the div backbone is holding with it's own, so we need to update this view
		this.setElement($('#'+this.id));
		
		this._player = $("#"+this.id +" embed")[0];	
		
		//register specific callbacks we care about
		this._player.addJScallback('complete',   'function(){Backbone.Events.trigger("bliptv:onFinish");}');	
		this._player.addJScallback('current_time_change',   'function(t){Backbone.Events.trigger("bliptv:updateCurrentTime", t);}');	
		this._player.addJScallback('player_state_change',   'function(s){Backbone.Events.trigger("bliptv:stateChange", s)}');	
		
		this.$el.css('z-index', '1');
		this.playerState.set({playerLoaded:true});
		this.playerState.set({visible:true});
	},
	
	_bootstrapPlayer: function(){	
		var self = this;

		//1) embed the player
		var url = 'http://blip.tv/play/'+this._video.get('provider_id')+'?enablejs=true&autostart='+this._playbackState.get('autoplayOnVideoDisplay')+'&showsharebutton=false&showfsbutton=false&chromeless=true&preferredRole=Blip%20HD%20720';

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
					.appendTo($("#"+this.id));
		$("#"+this._divId).width('100%').height('100%');


		//2) get metadata (just need duration) about the video
		this._updateViaMetadata();
	}
	
});

//Global function called by Bliptv player
function getUpdate(changeType, param1, param2){
	// Blip is not recognizing this as a callback at first for some reason so it is called here first so that we esure we get the player state
	if( changeType === "player_state_change") { Backbone.Events.trigger("bliptv:stateChange", param1); }
	if ( changeType === "ad_displaying") { /*TODO*/ }
	if( changeType === "playback_start" || changeType === "ad_initialized" ){ Backbone.Events.trigger("bliptv:playerReady"); }
}