// Integration of the Vimeo HTML5 video player.
// Spec: http://developer.vimeo.com/player/js-api
//
// CAVEAT: "loadVideo" does not exist in this API.  Must reload player for each new video.
// The performance of this doesn't (yet) seem to be worse than the non-universal player.
// But we need to use this player for mobile.
//
// Currently: using this player for web and mobile.  But could use this mobile-only.
//
libs.shelbyGT.VimeoHTML5VideoPlayerView = Support.CompositeView.extend({

  id: 'vimeo-player-holder',
  
  // stay within the context of our iframe
  _playerId: 'vimeo-player-iframe',
  _playerDomain: 'http://player.vimeo.com',
  _iFrame: null,

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
  },

  //NB: overriding leave b/c we don't necessarily have tear down (ie. when same video is reselected)
  leave: function(){
    this._isActivePlayer = false;
    this.pause();
    this.$el.css('visibility', 'hidden');
    this.$el.css('z-index', '-1');
    this.playerState.set({visible:false});
  },

  _cleanup: function(){
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
        this._video = video;
        //The HTML5 player has no "loadVideo" api call :-[
        this._bootstrapPlayer();
      }
    }

    this._video = video;
  },

  play: function(){
    if(this.playerState.get('playerLoaded')){
      this._postIframeMessage('play');
    }
  },

  pause: function(){
    if(this.playerState.get('playerLoaded')){
      this._postIframeMessage('pause');
    }
  },

  //expects pct to be [0.0, 1.0]
  seekByPct: function(pct){
    if(this.playerState.get('playerLoaded')){
      this._postIframeMessage('seekTo', pct * this.playerState.get('duration'));
    }
  },

  mute: function(){
    if(this.playerState.get('playerLoaded')){
      this._postIframeMessage('setVolume', 0);
      this.playerState.set({muted: true});
    }
  },

  unMute: function(){
    if(this.playerState.get('playerLoaded')){
      this._postIframeMessage('setVolume', 1);
      this.playerState.set({muted: false});
    }
  },

  //expects pct to be [0.0, 1.0]
  setVolume: function(pct){
    if(this.playerState.get('playerLoaded')){
      this._postIframeMessage('setVolume', pct);
      this.playerState.set({muted: true});
      this.playerState.set({volume: pct});
    }
  },

  //---------------------------------------------------
  // Private
  //---------------------------------------------------


  //---------------------------------------------------
  // Internal events
  //---------------------------------------------------
  _onPlay: function(){
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

  _onPlayProgress: function(data){
    this.playerState.set({duration:parseFloat(data.duration)});
    this.playerState.set({currentTime:parseFloat(data.seconds)});
  },

  _onLoadProgress: function(data){
    this.playerState.set({duration:parseFloat(data.duration)});
    this.playerState.set({bufferTime:(parseFloat(data.duration) * parseFloat(data.percent))});
  },
  
  _onPlayerReady: function(){
    this.playerState.set({playerLoaded: true});
    this.playerState.set({muted: false});
    this.playerState.set({playbackStatus: libs.shelbyGT.PlaybackStatus.paused});
    this.playerState.set({duration:0});
    this.playerState.set({currentTime:0});
    this.playerState.set({bufferTime:0});
    
    this._enablePlayerCallbacks();
    
    //this could get called at any time...
    if(this._isActivePlayer){
      this.$el.css('visibility', 'visible');
      this.$el.css('z-index', '1');
      this.playerState.set({visible:true});
      
    } else {
      this.pause();
    }
  },
  
  _enablePlayerCallbacks: function(){
    // Player won't post messages for these events unless we ask it to
    // So we enable the callbacks here but do the handling in _onIframeMessage
    this._postIframeMessage("addEventListener", "play");
    this._postIframeMessage("addEventListener", "pause");
    this._postIframeMessage("addEventListener", "finish");
    this._postIframeMessage("addEventListener", "seek");
    this._postIframeMessage("addEventListener", "playProgress");
    this._postIframeMessage("addEventListener", "loadProgress");
  },

  _bootstrapPlayer: function(){    
    var self = this,
    src = this._playerDomain+'/video/'+this._video.get('provider_id')+'?player_id='+this._playerId+'&title=0&byline=0&portrait=0&autoplay=1&api=1';
    
    if(this._$iFrame){ //need to re-load untile we have a loadVideo API call
      this.pause();
      this._$iFrame.attr('src', 'about:blank');
      this.playerState.set({playerLoaded:false});
      
      //setTimeout allows about:blank to take affect in this pass through the run loop
      //otherwise it has no affect b/c we immedately change the src without requiring a page render
      setTimeout(function(){
        self._$iFrame.attr('src', src);
      }, 1);
      //our iframe event listener will still receive callbacks

    } else {
      // Listen for messages from all iframes (filter for vimeo in callback)
      if (window.addEventListener) {
        window.addEventListener('message', $.proxy(this._onIframeMessage, this), false);
      } else {
        // IE
        window.attachEvent('onmessage', $.proxy(this._onIframeMessage, this));
      }

      //element isn't passed in
      this.setElement($('#'+this.id));
      
      this._$iFrame = $('<iframe  id="'+this._playerId+'" '+
                                 'src="'+src+'" '+
                                 'width="100%" '+
                                 'height="100%" '+
                                 'frameborder="0" '+
                                 'webkitallowfullscreen allowfullscreen> '+
                                 '</iframe>');
      this.$el.html(this._$iFrame);
    }
  },
  
  _onIframeMessage: function(e){
    if(e.origin !== this._playerDomain) return;
    
    try {
      data = JSON.parse(event.data);
      method = data.event || data.method;
    } catch(err) {
      console.log("Vimeo HTML5 - unexpected non-json event data: ", event.data);
      return;
    }
    
    switch(method){
      case "ready":
        this._onPlayerReady();
        break;
      case "play":
        this._onPlay();
        break;
      case "pause":
        this._onPause();
        break;
      case "playProgress":
        this._onPlayProgress(data.data);
        break;
      case "loadProgress":
        this._onLoadProgress(data.data);
        break;
      case "seek":
        break;
      case "finish":
        this._onFinish();
        break;
      default:
        console.log("Vimeo HTML5 onIframeMessage() -- unhandled:", method, data);
    }
  },
  
  _postIframeMessage: function(methodName, params){
    //api spec says to omit value when not needed
    //but their own code sends it: https://github.com/vimeo/player-api/blob/master/javascript/froogaloop.js#L127
    var data = JSON.stringify({ method: methodName,
                                value: params});
    //set url when posting message, for safety (see https://developer.mozilla.org/en-US/docs/DOM/window.postMessage)
    this._$iFrame[0].contentWindow.postMessage(data, this._$iFrame.attr('src').split('?')[0]);
  }

});
