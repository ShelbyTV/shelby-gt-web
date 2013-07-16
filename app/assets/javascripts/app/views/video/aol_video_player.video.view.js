//DOCS: http://www.collegehumor.com/moogaloop/api.php
//example 404 video: http://localhost.shelby.tv:3000/roll/4f9009d9b415cc466a000466/frame/504cedb6d1041245b5003156
libs.shelbyGT.AolVideoPlayerView = Support.CompositeView.extend({

  id: 'aol-player-holder',

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
      supportsChromeless: false,
      supportsMute: true,
      supportsVolume: true
      });

    //listen to private events
    Backbone.Events.bind("aol:playerReady", this._playerReady, this);
    Backbone.Events.bind("aol:onEnded", this._onEnded, this);
    Backbone.Events.bind("aol:stateChange", function(s) { self._onStateChange(s); });
    Backbone.Events.bind("aol:setCurrentTime", function(t) { self._setCurrentTime(t); });
    Backbone.Events.bind("aol:setDuration", function(d) { self._setDuration(d); });
  },

  //NB: overriding leave b/c we don't usually tear down
  leave: function(){
    //NB: If we decide to tear this down (ie. on low power devices) will need to do some more work in here and call super's leave()

    this._isActivePlayer = false;
    this.pause();
    this.$el.css('visibility', 'hidden');
    this.$el.css('z-index', '-1');

    this.$el.remove();
    this.playerState.set({playerLoaded:false});

    this.playerState.set({visible:false});
  },

  _cleanup: function(){
    Backbone.Events.unbind("aol:playerReady", this._playerReady, this);
    Backbone.Events.unbind("aol:onEnded", this._onEnded, this);
    Backbone.Events.unbind("aol:stateChange");
    Backbone.Events.unbind("aol:setCurrentTime");
    Backbone.Events.unbind("aol:setDuration");
  },

  render: function(container, video){
    this._isActivePlayer = true;

    //no harm in showing the player before it's been built - it just
    //looks black, but this makes it much easier to keep track
    //if its visibility state - less conditionals and asynchronicity to worry about
    if( !this.playerState.get('visible') ){
      this.$el.css('visibility', 'visible');
      this.$el.css('z-index', '1');
      this.playerState.set({visible:true});

    }

    if( !this.playerState.get('playerLoaded') ){
      this._video = video;
      this._bootstrapPlayer();
    }

    //playVideo will now be called by video display view
  },

  playVideo: function(video){
    //if we haven't been loaded, bootstrap will do everything
    if( this.playerState.get('playerLoaded') ){
      //since we have been loaded, need to make sure we only load_video if it's *different* from the current one (due to CH player bugginess)
      if(this._video !== video){
        this._video = video;
        this.leave();
        //this._player.playVideo(video.get('provider_id'), true);
        this._bootstrapPlayer();
        //this._player.play();
      } else {
        this.play();
      }
    }
  },

  play: function(){
    if( this._player ){
      this._player.play();
    }
  },

  pause: function(){
    if( this._player ){
      this._player.pause();
    }
  },

  //expects pct to be [0, 100]
  seekByPct: function(pct){
    if( this._player ){
      var _time = (pct * this.playerState.get('duration'));
      this._player.seekTo(Math.floor(_time));
    }
  },

  mute: function(){
    if(this._player){
      this._player.mute();
      this.playerState.set({muted: true});
    }
  },

  unMute: function(){
    if(this._player){
      this._player.mute(0);
      this.playerState.set({muted: true});
    }
  },

  //expects pct to be [0, 100]
  setVolume: function(pct){
    if(this._player){
      this._player.volue(pct);
      this.playerState.set({volume: pct});
    }
  },

  //---------------------------------------------------
  // Private
  //---------------------------------------------------

  //---------------------------------------------------
  // Internal events
  //---------------------------------------------------

  _setCurrentTime: function(t){
    this.playerState.set({currentTime:t.playheadTime});
  },

  _setDuration: function(d){
    this.playerState.set({duration:d.videoDuration});
  },

  _onStateChange: function(newState){
    var _state = newState.eventCode;
    switch(_state) {
      case 64:
        Backbone.Events.trigger("aol:setCurrentTime", newState);
        Backbone.Events.trigger("aol:setDuration", newState);
        if (newState.isPlayComplete) {
          Backbone.Events.trigger("aol:onEnded", newState);
        }
        break;
      case 4:
        this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.playing});
        if (!this._isActivePlayer) {
          this.pause();
        }
        break;
      case 8:
        this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.paused});
        break;
      default:
        break;
        //bit bucket
    }
  },

  _onEnded: function(p){
    if (p.isPlayComplete){
      this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.ended});
    }
  },

  _playerReady: function(e){
    this.id = e.player.divID;
    this.setElement($('#'+this.id));


    // need to make the video player the right size
    $("#"+e.player.divID+" object").css("position", "absolute").css("width", "100%").css("height", "100%").css('z-index', '1');;
    this._player = e.player;
    window.T = e;

    this.playerState.set({playerLoaded: true});
  },

  _bootstrapPlayer: function(){
    var _playerViewport = $('.videoplayer-viewport');
    var _width = _playerViewport.width();
    var _height = _playerViewport.height();

    var tag = document.createElement('script');
    // add htmlplayerforce=1 param to do that.
    // know however, that params that are passed to events are different.
    var url = "http://pshared.5min.com/Scripts/PlayerSeed.js?sid=239&autoStart="+ (this._playbackState.get('autoplayOnVideoDisplay') ? "true" : "false") +"&wmode=transparent&width="+_width+"&height="+_height+"&hasCompanion=false&videoControlDisplayColor=%23191919&playList="+ this._video.get("provider_id")+"&playerId="+this.id+"&onReady=AOLPlayerReady&onTimeUpdate=onAOLStateChange&onPause=onAOLStateChange&onPlay=onAOLStateChange";

    tag.src = url;
    var firstScriptTag = document.getElementById('youtube-player-holder');
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

});

//Global (and poorly named) functions called by Collegehumor player
function AOLPlayerReady(p){ Backbone.Events.trigger("aol:playerReady", p); }
function onAOLStateChange(newState){ Backbone.Events.trigger("aol:stateChange", newState); }

