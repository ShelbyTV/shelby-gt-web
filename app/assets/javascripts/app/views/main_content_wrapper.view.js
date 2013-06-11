libs.shelbyGT.MainContentWrapperView = Support.CompositeView.extend({

  _toolsContentPaneView : null,

  el: '.js-main-layout .content_lining',

  initialize: function(){
    this.model.bind('change:displayState', this._onChangeDisplayState, this);
  },

  _cleanup: function(){
    this.model.unbind('change:displayState', this._onChangeDisplayState, this);
  },

  render : function(){
    this.appendChild(new libs.shelbyGT.VideoContentPaneView({
      guide : shelby.models.guide,
      playbackState : shelby.models.playbackState
    }));
  },

  _onChangeDisplayState: function(guideModel, displayState){
    if (guideModel.previous('displayState') == libs.shelbyGT.DisplayState.userPreferences) {
      shelby.userInactivity.enableUserActivityDetection();
    }
    if (this._toolsContentPaneView) {
      this._toolsContentPaneView.leave();
      this._toolsContentPaneView = null;
    }
  }

});
