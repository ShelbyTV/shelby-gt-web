libs.shelbyGT.ContentPaneView = Support.CompositeView.extend({

  el: '.content_lining',

  options : {
    userDesires : null
  },

	initialize : function() {
    this.model.bind('change:displayState', this._onChangeDisplayState, this);
    this.render();
  },

  _cleanup : function(){
    this.model.unbind('change:displayState', this._onChangeDisplayState, this);
  },

  template : function(obj){
      return JST['content-pane'](obj);
  },

  render : function(){
    this.$el.html(this.template());
    
    this.renderChild(new libs.shelbyGT.notificationOverlayView({
      model : shelby.models.notificationState
    }));
    this.renderChild(new libs.shelbyGT.ContextOverlayView({
      guide : shelby.models.guide,
      guideOverlayModel : shelby.models.guideOverlay
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
      playbackState : shelby.models.playbackState,
      userDesires : shelby.models.userDesires
    }));
    this.renderChild(new libs.shelbyGT.MiniVideoProgress({
      playbackState : shelby.models.playbackState
    }));
  },

  _onChangeDisplayState : function(guideModel, displayState) {
    if (displayState == libs.shelbyGT.DisplayState.explore) {
      this.$('.explore').show();
      //pause the video player when obscuring it
      this.options.userDesires.set('playbackStatus', libs.shelbyGT.PlaybackStatus.paused);
      this.$('.videoplayer').hide();
    } else {
      this.$('.explore').hide();
      this.$('.videoplayer').show();
    }
  }

});