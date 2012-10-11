libs.shelbyGT.VideoContentPaneView = Support.CompositeView.extend({

  tagName: 'section',

  className: 'content_module videoplayer animate-easein',

  options : {
    userDesires : null
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
    this.renderChild(new libs.shelbyGT.VideoDisplayView({
      model : shelby.models.guide,
      playbackState : shelby.models.playbackState,
      userDesires : shelby.models.userDesires
    }));
    this.renderChild(new libs.shelbyGT.VideoControlsView({
      el: this.$('#video-controls'),
      guide : shelby.models.guide,
      playbackState : shelby.models.playbackState,
      userDesires : shelby.models.userDesires
    }));
    this.renderChild(new libs.shelbyGT.MiniVideoProgress({
      el: this.$('#mini-video-progress'),
      playbackState : shelby.models.playbackState
    }));
  }

});