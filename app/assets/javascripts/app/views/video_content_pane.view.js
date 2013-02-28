/*
* Render and manage the video views:
* - near the end of a video, set up and display the hot switcher
* - into the start of a video, bring down the hot switcher and go full screen video
*
* This view does not handle the video itself, playback, or any user actions.
*
*/
libs.shelbyGT.VideoContentPaneView = Support.CompositeView.extend({

  _persistentVideoInfoView : null,

  tagName: 'section',

  className: 'content_module videoplayer js-videoplayer animate-easein',

  options : {
    guide : null,         //injected at construction
    playbackState : null //injected
  },

  initialize : function(){
    shelby.models.guide.bind('change:displayState', this._onDisplayStateChange, this);
  },

  _cleanup : function(){
    shelby.models.guide.unbind('change:displayState', this._onDisplayStateChange, this);
  },

  template : function(obj){
      return SHELBYJST['video-content-pane'](obj);
  },

  render : function(){
    this.$el.html(this.template());

    this.renderChild(new libs.shelbyGT.notificationOverlayView({
      model : shelby.models.notificationState
    }));

    this.renderChild(new libs.shelbyGT.VideoDisplayView({
      model : shelby.models.guide,
      playbackState : shelby.models.playbackState,
      userDesires : shelby.models.userDesires
    }));
    this.renderChild(new libs.shelbyGT.VideoControlsView({
      el: this.$('#js-video-controls'),
      guide : shelby.models.guide,
      guideOverlayModel : shelby.models.guideOverlay,
      playbackState : shelby.models.playbackState,
      userDesires : shelby.models.userDesires
    }));
    this.renderChild(new libs.shelbyGT.MiniVideoProgress({
      el: this.$('#js-mini-video-progress'),
      playbackState : shelby.models.playbackState
    }));
  },

  _onDisplayStateChange : function(guideModel, displayState) {
    if (displayState) {
      if (displayState != libs.shelbyGT.DisplayState.dotTv) {
        if (!this._persistentVideoInfoView) {
          this._persistentVideoInfoView = new libs.shelbyGT.PersistentVideoInfoView({
            className : 'animate_module media_module js-inactivity-preemption persistent_video_info__wrapper',
            guide : shelby.models.guide,
            guideOverlayModel : shelby.models.guideOverlay,
            playlistManager : shelby.models.playlistManager,
            queuedVideos : shelby.models.queuedVideos,
            showNextFrame : true,
            userDesires : shelby.models.userDesires
          });
          this.insertChildBefore(this._persistentVideoInfoView, '.js-videoplayer-viewport');
        }
      } else if (this._persistentVideoInfoView) {
        this._persistentVideoInfoView.leave();
        this._persistentVideoInfoView = null;
      }
    }
  }

});