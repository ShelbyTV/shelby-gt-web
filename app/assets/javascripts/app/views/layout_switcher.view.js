libs.shelbyGT.LayoutSwitcherView = Support.CompositeView.extend({

  el: '#js-shelby-wrapper',

  initialize : function() {
    this.model.bind('change:displayState', this._onChangeDisplayState, this);
    this.render();
  },

  _cleanup : function() {
    this.model.unbind('change:displayState', this._onChangeDisplayState, this);
  },

  render : function(){
    this.renderChild(new libs.shelbyGT.AppHeaderView({model:shelby.models.user}));
    this.renderChild(new libs.shelbyGT.MainLayoutView({model:shelby.models.guide}));
    this.renderChild(new libs.shelbyGT.ExploreLayoutView());
  },

  _onChangeDisplayState : function(guideModel, displayState) {

    if (displayState == libs.shelbyGT.DisplayState.explore) {
      // hide any guide overlays
      this.options.guideOverlay.triggerImmediateHide();
      // show the explore layout
      this.$('.js-explore-layout').show();
      //pause the video player when obscuring it
      shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.paused);
    } else {
      if (guideModel.previous('displayState') == libs.shelbyGT.DisplayState.explore) {
        //if we're switching away from the explore view, hide any guide overlays
        this.options.guideOverlay.triggerImmediateHide();
      }
      this.$('.js-explore-layout').hide();
    }
  }

});