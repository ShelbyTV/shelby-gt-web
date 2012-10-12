/*
* Render and manage the video views:
* - near the end of a video, set up and display the hot switcher
* - into the start of a video, bring down the hot switcher and go full screen video
*
* This view does not handle the video itself, playback, or any user actions.
*
*/
libs.shelbyGT.VideoContentPaneView = Support.CompositeView.extend({

  tagName: 'section',

  className: 'content_module videoplayer js-videoplayer animate-easein',

  options : {
    guide : null,         //injected at construction
    playbackState : null, //injected
  },
  
  _hotswitchState : null,
  _duration : null,
  
  initialize: function(opts){
    this._hotswitchState = this.HOTSWITCH_STATES.videoNominal; //don't show the hotswitcher on startup
    
    this.bind('hotswitchStateChangeRequest', this._onHotswitchStateChangeRequest, this);
    this.options.playbackState.bind('change:activePlayerState', this._onNewPlayerState, this);
  },
  
  _cleanup : function(){
    this.unbind('hotswitchStateChangeRequest', this._onHotswitchStateChangeRequest, this);
    this.options.playbackState.unbind('change:activePlayerState', this._onNewPlayerState, this);
  },

  template : function(obj){
      return SHELBYJST['video-content-pane'](obj);
  },

  render : function(){
    this.$el.html(this.template());
    
    this.renderChild(new libs.shelbyGT.notificationOverlayView({
      model : shelby.models.notificationState
    }));
    this.renderChild(new libs.shelbyGT.ContextOverlayView({
      contextOverlayState : shelby.models.contextOverlayState,
      guide : shelby.models.guide,
      guideOverlayModel : shelby.models.guideOverlay,
      playbackState : shelby.models.playbackState
    }));
    this.renderChild(new libs.shelbyGT.PrerollVideoInfoView({
      el: this.$('#js-preroll-video-info-wrapper'),
      guide : shelby.models.guide,
      playbackState : shelby.models.playbackState
    }));
    this._hotswitchView = new libs.shelbyGT.HotswitchView({
      el: this.$('#js-hotswitch-content-wrapper'),
      guide : shelby.models.guide,
      guideOverlayModel : shelby.models.guideOverlay
    });
    this.renderChild(this._hotswitchView);
    this.renderChild(new libs.shelbyGT.VideoDisplayView({
      model : shelby.models.guide,
      playbackState : shelby.models.playbackState,
      userDesires : shelby.models.userDesires
    }));
    this.renderChild(new libs.shelbyGT.VideoControlsView({
      el: this.$('#video-controls'),
      guide : shelby.models.guide,
      guideOverlayModel : shelby.models.guideOverlay,
      playbackState : shelby.models.playbackState,
      userDesires : shelby.models.userDesires
    }));
    this.renderChild(new libs.shelbyGT.MiniVideoProgress({
      el: this.$('#mini-video-progress'),
      playbackState : shelby.models.playbackState
    }));
  },
  
  /*
   * -------- Hot Switch Handling -----------
   */
   
   // Time, in seconds, to show and hide the hotswitcher
   SHOW_HOTSWITCH_AT : 15,  //measured from END of video
   HIDE_HOTSWITCH_AT : 5,   //measured from START of video
   
   // CSS classes added and removed from our element
   HOTSWITCH_CSS : {
     hotswitchEnabled : "hotswitch-enabled",
     videoStarting : "hotswitch-video-starting",
     videoEnding : "hotswitch-video-ending"
   },
   
   // State machine
   HOTSWITCH_STATES : {
     videoEnding : 1,
     videoStarting : 2,
     videoNominal : 3,
     videoPaused : 4
   },
  
  _onNewPlayerState: function(playbackState, newPlayerState){
    var prevPlayerState = playbackState.previous('activePlayerState');
    if( prevPlayerState ){
      prevPlayerState.unbind('change:currentTime', this._onCurrentTimeChange, this);
      prevPlayerState.unbind('change:duration', this._onDurationChange, this);
      prevPlayerState.unbind('change:playbackStatus', this._onPlaybackStatusChange, this);
      
      //not hotswitching on initial video, so this is in here
      this._duration = null;
      this.trigger('hotswitchStateChangeRequest', this.HOTSWITCH_STATES.videoStarting);
    }
    newPlayerState.bind('change:currentTime', this._onCurrentTimeChange, this);
    newPlayerState.bind('change:duration', this._onDurationChange, this);
    newPlayerState.bind('change:playbackStatus', this._onPlaybackStatusChange, this);
    
    //need to fake-fire some change events since they may not change when swapping players
    //discussion:  If player A has duration D and gets swapped out, then gets swapped back in (without changing videos) it
    // will still have duration D.  Thus no change will be fired and we need to fake-fire here.
    this._onDurationChange('duration', newPlayerState.get('duration'));
  },
  
  _onDurationChange: function(attr, dur){
    this._duration = dur;
  },
  
  _onCurrentTimeChange: function(attr, time){
    switch (this._hotswitchState) {
      case this.HOTSWITCH_STATES.videoNominal:
        if(this._duration && (this._duration - time) < this.SHOW_HOTSWITCH_AT){
          this.trigger('hotswitchStateChangeRequest', this.HOTSWITCH_STATES.videoEnding);
        }
        break;
      case this.HOTSWITCH_STATES.videoStarting:
        if(time > this.HIDE_HOTSWITCH_AT){
          this.trigger('hotswitchStateChangeRequest', this.HOTSWITCH_STATES.videoNominal);
        }
        break;
      case this.HOTSWITCH_STATES.videoEnding:
        // _onNewPlayerState will only bring our state machine to HOTSWITCH_STATES.videoStarting
        // when the player itself actually changes
        if(time < this.HIDE_HOTSWITCH_AT){
          this.trigger('hotswitchStateChangeRequest', this.HOTSWITCH_STATES.videoStarting);
        }
    }
  },
  
  /* show the hotswitcher on pause */
  _onPlaybackStatusChange: function(attr, status){
    if( this._hotswitchState === this.HOTSWITCH_STATES.videoNominal && 
        status === libs.shelbyGT.PlaybackStatus.paused){
      this.trigger('hotswitchStateChangeRequest', this.HOTSWITCH_STATES.videoPaused);
    } else 
    if( this._hotswitchState === this.HOTSWITCH_STATES.videoPaused && 
        status !== libs.shelbyGT.PlaybackStatus.paused){
      this.trigger('hotswitchStateChangeRequest', this.HOTSWITCH_STATES.videoNominal);
    }
  },
  
  _onHotswitchStateChangeRequest : function(newState) {
    this._hotswitchState = newState;
    switch (this._hotswitchState) {
      case this.HOTSWITCH_STATES.videoEnding:
      case this.HOTSWITCH_STATES.videoPaused:
        this._hotswitchView.render();
        this.$el.addClass(this.HOTSWITCH_CSS.hotswitchEnabled)
                .addClass(this.HOTSWITCH_CSS.videoEnding);
        break;
      case this.HOTSWITCH_STATES.videoStarting:
        this.$el.removeClass(this.HOTSWITCH_CSS.videoEnding)
                .addClass(this.HOTSWITCH_CSS.videoStarting);
        break;
      case this.HOTSWITCH_STATES.videoNominal:
        this.$el.removeClass(this.HOTSWITCH_CSS.hotswitchEnabled)
                .removeClass(this.HOTSWITCH_CSS.videoStarting)
                .removeClass(this.HOTSWITCH_CSS.videoEnding);
        break;
    }
  }

});