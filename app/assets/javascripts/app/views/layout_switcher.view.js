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
    this.renderChild(new libs.shelbyGT.GuideHeaderView({model:shelby.models.user}));
    this.renderChild(new libs.shelbyGT.MainLayoutView({model:shelby.models.guide}));
    this.renderChild(new libs.shelbyGT.ExploreLayoutView());
  },

  _onChangeDisplayState : function(guideModel, displayState) {
    if (displayState == libs.shelbyGT.DisplayState.explore) {
      this.$('.js-explore-layout').show();
      //pause the video player when obscuring it
      shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.paused);
    } else {
      this.$('.js-explore-layout').hide();
    }
  }

});