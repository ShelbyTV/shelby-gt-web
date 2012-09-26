//
// display and handle the ui elements that controll the current player
//

libs.shelbyGT.VideoControlsView = Support.CompositeView.extend({

  events : {
    "click .js-playback" : "_togglePlayback",
    "click .js-mute" : "_toggleMute",
    "click .video-player-quality.hd-on" : "_hdOff",
    "click .video-player-quality.hd-off" : "_hdOn",
    "click .video-player-progress": "_onScrubTrackClick",
    "click .video-player-fullscreen" : "_toggleFullscreen",
    "click .js-video-player-next" : "_nextVideo",
    "click .js-video-player-prev" : "_prevVideo"
  },

  el: '#video-controls',

  _currentDuration: 0,

  _shouldUpdateScrubHandle: true,

  initialize: function(opts){
    this._playbackState = opts.playbackState;
    this._userDesires = opts.userDesires;

    this._userDesires.bind('change:guideShown', this._guideVisibilityChange, this);
    this._userDesires.bind('change:mute', this._onUserDesiresMuteChange, this);

    this._playbackState.bind('change:activePlayerState', this._onNewPlayerState, this);
    if( this._playbackState.get('activePlayerState') !== null ) {
      this._onNewPlayerState(this._playbackState, this._playbackState.get('activePlayerState'));
    }
  },

  _cleanup: function() {
    this._userDesires.unbind('change:guideShown', this._guideVisibilityChange, this);

    this.model.unbind('change:activePlayerState', this._onNewPlayerState, this);
  },

  template: function(obj){
    return JST['video-controls'](obj);
  },

  render: function(){
    this.$el.html(this.template());
    if( this._playbackState.get('activePlayerState') === null ) {
      this.$el.addClass('js-disabled');
    }

    var self = this;
    this.$('.video-player-scrubber').draggable({axis: 'x', containment: 'parent',
      start: function(event, ui){ self._onScrubberDragStart(event, ui); },
      stop:  function(event, ui){ self._onScrubberDragStop(event, ui); } });
  },

  //--------------------------------------
  // Handle changes of current playerState
  //--------------------------------------

  _onNewPlayerState: function(playbackState, newPlayerState){
    this.$el.removeClass('js-disabled');

    var prevPlayerState = playbackState.previous('activePlayerState');
    if( prevPlayerState ){
      prevPlayerState.unbind('change:playbackStatus', this._onPlaybackStatusChange, this);
      prevPlayerState.unbind('change:currentTime', this._onCurrentTimeChange, this);
      prevPlayerState.unbind('change:bufferTime', this._onBufferTimeChange, this);
      prevPlayerState.unbind('change:duration', this._onDurationChange, this);
      prevPlayerState.unbind('change:muted', this._onMutedChange, this);
      prevPlayerState.unbind('change:volume', this._onVolumeChange, this);
      prevPlayerState.unbind('change:hdVideo', this._onHdVideoChange, this);
      prevPlayerState.unbind('change:supportsMute', this._onSupportsMuteChange, this);
      prevPlayerState.unbind('change:supportsVolume', this._onSupportsVolumeChange, this);
      prevPlayerState.unbind('change:supportsVideoQuality', this._onSupportsVideoQualityChange, this);
    }

    newPlayerState.bind('change:playbackStatus', this._onPlaybackStatusChange, this);
    newPlayerState.bind('change:currentTime', this._onCurrentTimeChange, this);
    newPlayerState.bind('change:bufferTime', this._onBufferTimeChange, this);
    newPlayerState.bind('change:duration', this._onDurationChange, this);
    newPlayerState.bind('change:muted', this._onMutedChange, this);
    newPlayerState.bind('change:volume', this._onVolumeChange, this);
    newPlayerState.bind('change:hdVideo', this._onHdVideoChange, this);
    newPlayerState.bind('change:supportsMute', this._onSupportsMuteChange, this);
    newPlayerState.bind('change:supportsVolume', this._onSupportsVolumeChange, this);
    newPlayerState.bind('change:supportsVideoQuality', this._onSupportsVideoQualityChange, this);

    this.render();

    //need to fake-fire some change events since they may not change when swapping players
    //discussion:  If player A has duration D and gets swapped out, then gets swapped back in (without changing videos) it
    // will still have duration D.  Thus no change will be fired and we need to fake-fire here.
    this._onDurationChange('duration', newPlayerState.get('duration'));
    this._onMutedChange('muted', newPlayerState.get('muted'));
    this._onHdVideoChange('hdVideo', newPlayerState.get('hdVideo'));
    this._onSupportsMuteChange('supportsMute', newPlayerState.get('supportsMute'));
    this._onSupportsVolumeChange('supportsVolume', newPlayerState.get('supportsVolume'));
    this._onSupportsVideoQualityChange('supportsVideoQuality', newPlayerState.get('supportsVideoQuality'));
  },

  _onPlaybackStatusChange: function(attr, curState){
    switch(curState){
      case libs.shelbyGT.PlaybackStatus.paused:
        this.$el.removeClass('js-playing').addClass('js-paused');
        this.$('.video-player-play').removeClass('pause');
        break;
      case libs.shelbyGT.PlaybackStatus.playing:
        this.$el.removeClass('js-paused').addClass('js-playing');
        this.$('.video-player-play').addClass('pause');
        // special case: if the explore view is showing and we switch to playing, we don't actually want to
        //  play behind the obscuring explore view, so immediately pause
        //  case where this definitely happens: ESPN Ooyala switching from buffering to playing states
        if (this.options.guide.get('displayState') == libs.shelbyGT.DisplayState.explore) {
          this._userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.paused);
        }
        break;
      case libs.shelbyGT.PlaybackStatus.ended:
        Backbone.Events.trigger('playback:next');
        break;
    }
  },

  _onCurrentTimeChange: function(attr, curTime){
    var pct = (curTime / this._currentDuration) * 100;
    if( this._shouldUpdateScrubHandle ){
      this.$('.video-player-scrubber').css('left',pct+"%");
    }

    var curTimeH = parseInt(curTime / (60*60), 10 ) % 60,
        curTimeM = parseInt(curTime / 60, 10 ) % 60,
        curTimeS = parseInt(curTime % 60, 10);

    this.$('.video-player-progress-elapsed').width(pct+"%");
    this.$('.video-player-timeline  span:first-child').text(prettyTime(curTimeH, curTimeM, curTimeS));
  },

  _onBufferTimeChange: function(attr, bufferTime){
    var pct = (bufferTime / this._currentDuration) * 100;
    this.$('.video-player-progress-load').width(pct+"%");
  },

  _onDurationChange: function(attr, val){
    this._currentDuration = val;

    var durationH = parseInt(val / 3600, 10 ) % 60,
    durationM = parseInt(val / 60, 10 ) % 60,
    durationS = parseInt(val % 60, 10);

    this.$('.video-player-timeline  span:last-child').text(prettyTime(durationH, durationM, durationS));
  },

  _onMutedChange: function(attr, muted){
    muted ? this.$el.addClass('muted') : this.$el.removeClass('muted');
  },

  _onVolumeChange: function(attr, volPct){
    //TODO
    //console.log("TODO: move volume slider to "+volPct+"%");
  },

  _onHdVideoChange: function(attr, hd){
    if(hd){
      this.$('.video-player-quality').addClass('hd-on').removeClass('hd-off');
    } else {
      this.$('.video-player-quality').removeClass('hd-on').addClass('hd-off');
    }
  },

  _onSupportsMuteChange: function(attr, supportsMute){
    supportsMute ? this.$el.removeClass('disable-mute') : this.$el.addClass('disable-mute');
  },

  _onSupportsVolumeChange: function(attr, supportsVolume){
    supportsVolume ? this.$el.removeClass('disable-volume') : this.$el.addClass('disable-volume');
  },

  _onSupportsVideoQualityChange: function(attr, supportsVideoQuality){
    supportsVideoQuality ? this.$el.removeClass('disable-video-quality') : this.$el.addClass('disable-video-quality');
  },

  //--------------------------------------
  // Handle user events on the player controls
  //--------------------------------------

  _togglePlayback : function(){
    var activePlayerState = this._playbackState.get('activePlayerState');
    if (activePlayerState) {
      var _newPlaybackStatus = (activePlayerState.get('playbackStatus')===libs.shelbyGT.PlaybackStatus.playing) ? libs.shelbyGT.PlaybackStatus.paused : libs.shelbyGT.PlaybackStatus.playing;
      this._userDesires.triggerTransientChange('playbackStatus', _newPlaybackStatus);
    }
  },

  _onUserDesiresMuteChange : function(){
    this.$('.js-mute').toggleClass('mute').toggleClass('unmute');
  },

  _toggleMute : function(){
    this._userDesires.set({mute: !this._userDesires.get('mute')});
  },

  _hdOn: function(el){
    this._userDesires.set({hdVideo: true});
  },

  _hdOff: function(el){
    this._userDesires.set({hdVideo: false});
  },

  _onScrubTrackClick: function(el){
    this._doRelativeSeek(el.pageX);
  },

  _onScrubberDragStart: function(event, ui){
    this._shouldUpdateScrubHandle = false;
  },

  _onScrubberDragStop: function(event, ui){
    this._shouldUpdateScrubHandle = true;
    this._doRelativeSeek(event.pageX);
  },

  _toggleFullscreen: function(){
    var guideShown = this._userDesires.get('guideShown');
    if( guideShown ){
      this._userDesires.set({guideShown: false});
      this.$(".video-player-fullscreen").addClass("cancel");
    } else {
      this._userDesires.set({guideShown: true});
      this.$(".video-player-fullscreen").removeClass("cancel");
    }
  },

  _nextVideo: function(){
    this._userDesires.set('changeVideo', 1);
    this._userDesires.unset('changeVideo');
  },

  _prevVideo: function(){
    this._userDesires.set('changeVideo', -1);
    this._userDesires.unset('changeVideo');
  },

  //TODO: handle volume change this._userDesires.set({volume: (clickPositionPct) })

  //--------------------------------------
  // handle user desires
  //--------------------------------------

  _guideVisibilityChange: function(attr, guideShown){
    if( guideShown ){
      $('.js-main-layout .js-guide').removeClass("hide-guide");
      this.$el.find('.video-player-tools').removeClass("full-width");
      this.$el.find('.video-player-next').removeClass("full-width");
    } else {
      $('.js-main-layout .js-guide').addClass("hide-guide");
      this.$el.find('.video-player-tools').addClass("full-width");
      this.$el.find('.video-player-next').addClass("full-width");
    }
  },

  //--------------------------------------
  // helpers
  //--------------------------------------

  _doRelativeSeek: function(pageX){
    var scrubTrack = this.$('.video-player-progress');
    var seekPct = ( (pageX - scrubTrack.offset().left) / scrubTrack.width() );
    seekPct = Math.min(Math.max(seekPct, 0.0), 1.0);
    this._userDesires.set({currentTimePct: seekPct});
  }

});
