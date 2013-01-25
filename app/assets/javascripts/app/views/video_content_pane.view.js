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
    playbackState : null //injected
  },

  initialize: function(opts){
  },

  _cleanup : function(){
  },

  template : function(obj){
      return SHELBYJST['video-content-pane'](obj);
  },

  render : function(){
    this.$el.html(this.template());

    this.renderChild(new libs.shelbyGT.notificationOverlayView({
      model : shelby.models.notificationState
    }));
    // this.renderChild(new libs.shelbyGT.PrerollVideoInfoView({
    //   el: this.$('#js-preroll-video-info-wrapper'),
    //   guide : shelby.models.guide,
    //   playbackState : shelby.models.playbackState
    // }));
    this.renderChild(new libs.shelbyGT.PersistentVideoInfoView({
      el: this.$('#js-persistent-video-info-wrapper'),
      guide : shelby.models.guide,
      guideOverlayModel : shelby.models.guideOverlay,
      playlistManager : shelby.models.playlistManager,
      queuedVideos : shelby.models.queuedVideos,
      userDesires : shelby.models.userDesires
    }));

    // CHANNEL HEADER
    this.renderChild(new libs.shelbyGT.ChannelInfoView({
      el: this.$('#js-channel-info-wrapper'),
      guide : shelby.models.guide,
      userDesires : shelby.models.userDesires,
      channel : shelby.models.multiplexedVideo
    }));
    ////-------------------------------------------////

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
  }

});