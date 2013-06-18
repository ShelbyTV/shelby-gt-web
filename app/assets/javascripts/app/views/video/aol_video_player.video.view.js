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

    console.log("AOL Video");

    this._playbackState = opts.playbackState;

    this.playerState = new libs.shelbyGT.PlayerStateModel({
      playerView: this,
      supportsChromeless: true,
      supportsMute: true,
      supportsVolume: false
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
        this._player.play();
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

  //expects pct to be [0.0, 1.0]
  seekByPct: function(pct){
    if( this._player ){
      this._player.seekVideo( (pct * this.playerState.get('duration')) );
    }
  },

  mute: function(){
    if(this._player){
      this._player.setVolume(0);
      this.playerState.set({muted: true});
    }
  },

  unMute: function(){
    if(this._player){
      this._player.setVolume(1);
      this.playerState.set({muted: true});
    }
  },

  //expects pct to be [0.0, 1.0]
  setVolume: function(pct){
    if(this._player){
      this._player.setVolume(pct);
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
    this.playerState.set({currentTime:t});
  },

  _setDuration: function(d){
    this.playerState.set({duration:d});
  },

  _onStateChange: function(newState){
    switch(newState) {
      case 'ended':
        // this marks the end of video, but an add plays after this, global callback function used is: detectEndVideo()
        break;
      case 'playing':
        this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.playing});
        if (!this._isActivePlayer) {
          this.pause();
        }
        break;
      case 'pause':
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

  _onEnded: function(){
    this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.ended});
  },

  _playerReady: function(e){
    console.log("PLAYER READY", e);
    //CollegeHumor replaces the div backbone is holding with it's own, so we need to update this view
    this.setElement($('#'+this.id));

    this._player = e.player;
    window.TEST = e.player;
    //auto play is not a config option, need to press play meow...
    if( this._playbackState.get('autoplayOnVideoDisplay') && this._isActivePlayer ){ this.play(); }

    this.playerState.set({playerLoaded: true});
  },

  _bootstrapPlayer: function(){
    console.log("bootstraping AOL");
    var tag = document.createElement('script');
    var url = "http://pshared.5min.com/Scripts/PlayerSeed.js?sid=239&amp;width=1000&amp;height=800&amp;colorPallet=%23FFEB00&amp;hasCompanion=false&amp;videoControlDisplayColor=%23191919&amp;playList=517823407&amp;onReady=AOLPlayerReady";
    tag.src = url;
    var firstScriptTag = document.getElementById('youtube-player-holder');
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    //swfobject.embedSWF(url, this.id, "100%", "100%", "9.0.0", null, null, { allowScriptAccess: "always", wmode: "transparent" });
  }

});

//Global (and poorly named) functions called by Collegehumor player
function AOLPlayerReady(p){ Backbone.Events.trigger("aol:playerReady", p); }
function onVideoStartPlay(newState){ Backbone.Events.trigger("aol:stateChange", newState); }
function onTimeUpdate(e){ Backbone.Events.trigger("aol:onEnded", e); }
function onTimeUpdate(t){ Backbone.Events.trigger("aol:setCurrentTime", t); }
function getDuration(d){ Backbone.Events.trigger("aol:setDuration", d); }
