libs.shelbyGT.VideoContentPaneView = Support.CompositeView.extend({

  el: '.js-main-layout .content_lining',

  options : {
    userDesires : null
  },

  template : function(obj){
      return JST['video-content-pane'](obj);
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
      guide : shelby.models.guide,
      playbackState : shelby.models.playbackState
    }));
    this.renderChild(new libs.shelbyGT.VideoDisplayView({
      model : shelby.models.guide,
      playbackState : shelby.models.playbackState,
      userDesires : shelby.models.userDesires
    }));
    this.renderChild(new libs.shelbyGT.VideoControlsView({
      guide : shelby.models.guide,
      playbackState : shelby.models.playbackState,
      userDesires : shelby.models.userDesires
    }));
    this.renderChild(new libs.shelbyGT.MiniVideoProgress({
      playbackState : shelby.models.playbackState
    }));
  }

});