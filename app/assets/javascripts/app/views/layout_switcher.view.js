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
    this.renderChild(new libs.shelbyGT.OnboardingLayoutView());
  },

  _onChangeDisplayState : function(guideModel, displayState) {
    
    // try something like views.each(this.hide()) here - only show in switch cases

    switch (displayState){
      case libs.shelbyGT.DisplayState.explore:
        this.options.guideOverlay.triggerImmediateHide();
        // show the explore layout
        this.$('.js-onboarding-layout').hide();
        this.$('.js-explore-layout').show();
        //pause the video player when obscuring it
        shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.paused);
      break;
      case libs.shelbyGT.DisplayState.onboarding:
        this.options.guideOverlay.triggerImmediateHide();
        // show the onboarding layout
        this.$('.js-explore-layout').hide();
        this.$('.js-onboarding-layout').show();
        //pause the video player when obscuring it
        shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.paused);
      break;
      default:
        if (guideModel.previous('displayState') == libs.shelbyGT.DisplayState.explore) {
          //if we're switching away from the explore view, hide any guide overlays
          this.options.guideOverlay.triggerImmediateHide();
        }
        this.$('.js-explore-layout, .js-onboarding-layout').hide();
    }

    /*if (displayState == libs.shelbyGT.DisplayState.explore) {
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
    }*/
  }

});
