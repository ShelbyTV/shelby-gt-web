libs.shelbyGT.ESPNVideoPlayerView = Support.CompositeView.extend({

  id: 'espn-player-holder',

  _video: null,
  _player: null,

  _playbackState: null,

  playerState: null,

  _playerParams: null,

  _postVideoAutoPlay: false,

  initialize: function(opts){
    var self = this;
    this._playbackState = opts.playbackState;

    this.playerState = new libs.shelbyGT.PlayerStateModel({
      playerView: this,
      supportsChromeless: true,
      supportsMute: true,
      supportsVolume: true
      });

    this._playerParams =  {
        callback: window.receiveEspnEvent,
        playerBrandingId: "4ef8000cbaf34c1687a7d9a26fe0e89e",
        pcode: "1kNG061cgaoolOncv54OAO1ceO-I",
        hasModuleParams: "1"
      };

    //listen to private events
    Backbone.Events.bind("espn:onFinish", this._onFinish, this);
    Backbone.Events.bind("espn:playerEmbedded", function(p) { self._onPlayerEmbedded(p); });
    Backbone.Events.bind("espn:setCurrentTime", function(p) { self._setCurrentTime(p); });
    Backbone.Events.bind("espn:setDuration", function(d) { self._setDuration(d); });
    Backbone.Events.bind("espn:stateChanged", function(s, e) { self._stateChanged(s, e); });
  },

  //NB: overriding leave b/c we don't usually tear down
  leave: function(){
    //NB: If we decide to tear this down (ie. on low power devices) will need to do some more work in here and call super's leave()

    this.pause();
    this.$el.css('visibility', 'hidden');
    this.$el.css('z-index', '-1');
    this.playerState.set({visible:false});
  },

  _cleanup: function(){
    Backbone.Events.unbind("espn:onFinish", this._onFinish(), this);
    Backbone.Events.unbind("espn:setCurrentTime");
    Backbone.Events.unbind("espn:setDuration");
    Backbone.Events.unbind("espn:stateChanged");
  },

  render: function(container, video){
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
    // our app or a user explicitly asked to play a video
    // this is no longer ESPN player auto play state
    this._postVideoAutoPlay = false;

    if( this.playerState.get('playerLoaded') ){
      if( this._video === video ){
        this.play();
      } else {
        //load up new video
        this._playerParams.externalId = "espn:"+video.get('provider_id');
        this._playerParams.autoplay = this._playbackState.get('autoplayOnVideoDisplay') ? 1 : 0;
        this._player.setQueryStringParameters(this._playerParams);
      }
    }

    this._video = video;
  },

  play: function(){
    if( this._player ){
      this._player.playMovie();
    }
  },

  pause: function(){
    if( this._player ){
      this._player.pauseMovie();
    }
  },

  //expects pct to be [0.0, 1.0]
  seekByPct: function(pct){
    if( this._player ){
      this._player.setPlayheadTime( (pct * this._player.getTotalTime()) );
    }
  },

  mute: function(){
    if(this._player){
      this._player.setVolume(0.0);
      this.playerState.set({muted: true});
      this.playerState.set({volume: this._player.getVolume()});
    }
  },

  unMute: function(){
    if(this._player){
      this._player.setVolume(1.0);
      this.playerState.set({muted: false});
      this.playerState.set({volume: this._player.getVolume()});
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

  _setCurrentTime: function(p){
    this.playerState.set({currentTime:p.playheadTime || p.newPlayheadTime});
  },

  _setDuration: function(d){
    this.playerState.set({duration:d});
  },

  _onFinish: function(){
    // the ESPN player will move on to its autoplay functionality
    this._postVideoAutoPlay = true;
    this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.ended});
  },

  //states passed by ooyala are [playing, paused, buffering, stopped] and i send [adStarted, adCompleted]
  //which we get from a different, specific callback
  _stateChanged: function(state, errorCode){

    switch(state){
      case 'playing':
        this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.playing});
        // if this video started because of ESPN player's post video autoplay functionality,
        // immediately pause it
        if (this._postVideoAutoPlay) {
          this.pause();
          // we're no longer on the video we started on, so we can't just restart the same video
          // by calling play
          this._video = null;
        }
        break;
      case 'buffering':
        this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.buffering});
        break;
      case 'paused':
      case 'stopped':
        this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.paused});
        break;
      case 'adStarted':
        //this works, but messes with the video duration length displayed in player controls...
        this._player.skipAd();
        break;
      case 'adCompleted':
        // ooyala fires "playComplete" which is handled by _onFinish above to signal end of video
        break;
      case 'error':
        this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.error.generic});
        break;
    }
  },

  _onPlayerEmbedded: function(playerId){
    //Ooyala replaces the div backbone is holding with it's own, so we need to update this view
    this.setElement($('#'+this.id));
    this._player = $("#"+playerId)[0];

    this.playerState.set({playerLoaded: true});
    this.playerState.set({visible:true});
    this.$el.css('z-index', '1');
  },

  _bootstrapPlayer: function(){
    var src = "http://player.ooyala.com/player.js?externalId=espn:"+this._video.get('provider_id')+"&callback=window.receiveEspnEvent&debug=false&hasModuleParams=1&pcode=1kNG061cgaoolOncv54OAO1ceO-I&playerBrandingId=a28f1994885a41098953d166c34cf81c&targetReplaceId="+this.id+"&wmode=opaque&autoplay="+(this._playbackState.get('autoplayOnVideoDisplay') ? 1 : 0);
    //write to head, where script will be downloaded and run
    var tag = document.createElement('script');
    tag.src = src;

    //Firefox 3.6.x doesn't support document.head
    (document.head || document.getElementsByTagName( "head" )[0]).appendChild(tag);
  }

});

//Global function called by Ooyala player
function receiveEspnEvent(playerId, eventName, params){
  switch(eventName){
    case 'playComplete':
      Backbone.Events.trigger("espn:onFinish");
      break;
    case 'playerEmbedded':
      Backbone.Events.trigger("espn:playerEmbedded", playerId);
      break;
    case 'stateChanged':
      Backbone.Events.trigger("espn:stateChanged", params.state, params.errorCode);
      break;
    case 'adStarted':
      Backbone.Events.trigger("espn:stateChanged", 'adStarted');
      break;
    case 'adCompleted':
      Backbone.Events.trigger("espn:stateChanged", 'adCompleted');
      break;
    case 'playheadTimeChanged':
    case 'seeked':
      Backbone.Events.trigger("espn:setCurrentTime", params);
      break;
    case 'totalTimeChanged':
      Backbone.Events.trigger("espn:setDuration", params.totalTime);
      break;
  }
}