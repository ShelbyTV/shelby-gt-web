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
    if (this.model.get('displayState') == libs.shelbyGT.DisplayState.tools) {
      this._toolsContentPaneView = new libs.shelbyGT.ExternalToolsContentPaneView();
      this.appendChild(this._toolsContentPaneView);
    }
  },

  _onChangeDisplayState: function(guideModel, displayState){
    if (displayState == libs.shelbyGT.DisplayState.tools) {
      shelby.userInactivity.disableUserActivityDetection();
      this._toolsContentPaneView = new libs.shelbyGT.ExternalToolsContentPaneView();
      this.appendChild(this._toolsContentPaneView);
    } else {
      shelby.userInactivity.enableUserActivityDetection();
      if (this._toolsContentPaneView) {
        this._toolsContentPaneView.leave();
        this._toolsContentPaneView = null;
      }
    }
  }

});