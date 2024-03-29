//example non-embedable video: http://localhost.shelby.tv:3000/roll/4f900cf5b415cc466a0005bb/frame/5069fa5f9a725b0c1d01564b?awesm=shl.by_n0x
libs.shelbyGT.VimeoVideoPlayerView = Support.CompositeView.extend({

  id: 'vimeo-player-holder',

  _video: null,
  _player: null,
  _isActivePlayer : false,

  _playbackState: null,

  playerState: null,

  initialize: function(opts){
    var self = this;

    this._playbackState = opts.playbackState;

    this.playerState = new libs.shelbyGT.PlayerStateModel({
      playerView: this,
      supportsChromeless: true,
      supportsMute: true,
      supportsVolume: true
      });

    //listen to private Vimeo events
    Backbone.Events.bind("vimeo:playerLoaded", this._onPlayerLoaded, this);
    Backbone.Events.bind("vimeo:onPlay", this._onPlay, this);
    Backbone.Events.bind("vimeo:onPause", this._onPause, this);
    Backbone.Events.bind("vimeo:onFinish", this._onFinish, this);
    Backbone.Events.bind("vimeo:updateCurrentTime", function(s) { self._updateCurrentTime(s); });
    Backbone.Events.bind("vimeo:updateBufferTime", function(p) { self._updateBufferTime(p); });
  },

  //NB: overriding leave b/c we don't usually tear down
  leave: function(){
    //NB: If we decide to tear this down (ie. on low power devices) will need to do some more work in here and call super's leave()

    this._isActivePlayer = false;
    this.pause();
    this.$el.css('visibility', 'hidden');
    this.$el.css('z-index', '-1');
    this.playerState.set({visible:false});
  },

  _cleanup: function(){
    Backbone.Events.unbind("vimeo:playerLoaded", this._onPlayerLoaded, this);
    Backbone.Events.unbind("vimeo:onPlay", this._onPlay, this);
    Backbone.Events.unbind("vimeo:onPause", this._onPause, this);
    Backbone.Events.unbind("vimeo:onFinish", this._onFinish, this);
    Backbone.Events.unbind("vimeo:updateCurrentTime");
    Backbone.Events.unbind("vimeo:updateBufferTime");
  },

  render: function(container, video){
    this._isActivePlayer = true;
    if( !this.playerState.get('playerLoaded') ){
      this._video = video;
      this._bootstrapPlayer();
    }
    else if( !this.playerState.get('visible') ){
      this.$el.css('visibility', 'visible');
      this.$el.css('z-index', '1');
      this.playerState.set({visible:true});
      //playVideo will be called by video display view
    }
  },

  playVideo: function(video){
    if( this.playerState.get('playerLoaded') ){
      if( this._video === video ){
        this.play();
      } else {
        //load up new video
        this._player.api_loadVideo(video.get('provider_id'));
      }
    }

    this._video = video;
  },

  play: function(){
    if( this._player ){
      this._player.api_play();
    }
  },

  pause: function(){
    if( this._player ){
      this._player.api_pause();
    }
  },

  //expects pct to be [0.0, 1.0]
  seekByPct: function(pct){
    if( this._player ){
      this._player.api_seek( (pct * this._player.api_getDuration()) );
    }
  },

  mute: function(){
    if(this._player){
      this._player.api_setVolume(0);
      this.playerState.set({muted: true});
      this.playerState.set({volume: this._player.api_getVolume()});
    }
  },

  unMute: function(){
    if(this._player){
      this._player.api_setVolume(100);
      this.playerState.set({muted: false});
      this.playerState.set({volume: this._player.api_getVolume()});
    }
  },

  //expects pct to be [0.0, 1.0]
  setVolume: function(pct){
    if(this._player){
      this._player.api_setVolume(pct*100);
      this.playerState.set({volume: this._player.api_getVolume()});
    }
  },

  //---------------------------------------------------
  // Private
  //---------------------------------------------------


  //---------------------------------------------------
  // Internal events
  //---------------------------------------------------
  _onPlay: function(){
    this.playerState.set({duration:this._player.api_getDuration()});
    this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.playing});
    if (!this._isActivePlayer) {
      this.pause();
    }
  },

  _onPause: function(){
    this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.paused});
  },

  _onFinish: function(){
    this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.ended});
  },

  _updateCurrentTime: function(s){
    this.playerState.set({currentTime:s});
  },

  _updateBufferTime: function(p){
    this.playerState.set({duration:p.duration});
    this.playerState.set({bufferTime:(p.duration * p.decimal)});
  },

  _onReady: function(){
    this.$el.css('z-index', '1');
    this.playerState.set({playerLoaded: true});
    this.playerState.set({visible:true});

    //auto play is not a config option, need to press play meow...
    if( this._playbackState.get('autoplayOnVideoDisplay') ){ this.play(); }

    //TODO: set volume via this._playbackState.get('desiredVolume')
  },

  _onPlayerLoaded: function(){
    //Vimeo replaces the div backbone is holding with it's own, so we need to update this view
    this.setElement($('#'+this.id));

    this._player = $("#"+this.id)[0];

    var self = this;
    this._player.api_addEventListener('onReady', self._onReady());

    this._player.api_addEventListener('onFinish',   "function(){ Backbone.Events.trigger('vimeo:onFinish') }");
    this._player.api_addEventListener('onPlay',   "function(){ Backbone.Events.trigger('vimeo:onPlay') }");
    this._player.api_addEventListener('onPause',   "function(){ Backbone.Events.trigger('vimeo:onPause') }");
    this._player.api_addEventListener('playProgress',   "function(s){ Backbone.Events.trigger('vimeo:updateCurrentTime', s) }");
    this._player.api_addEventListener('seek',   "function(s){ Backbone.Events.trigger('vimeo:updateCurrentTime', s) }");
    this._player.api_addEventListener('loadProgress',   "function(p){ Backbone.Events.trigger('vimeo:updateBufferTime', p) }");
  },

  _bootstrapPlayer: function(){

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

    swfobject.embedSWF(
      "http://vimeo.com/moogaloop.swf",
      this.id,
      "100%", "100%",
      "9.0.0","expressInstall.swf",
      flashvars,
      { allowScriptAccess: "always", wmode: "transparent" });
  }
});

//Global funciton called by Vimeo player
function vimeo_player_loaded(playerId) {
  Backbone.Events.trigger("vimeo:playerLoaded");
}