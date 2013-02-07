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
    this.renderChild(new libs.shelbyGT.AppHeaderView({
      model : shelby.models.user,
      guide : shelby.models.guide
    }));
    this.renderChild(new libs.shelbyGT.MainLayoutView({model:shelby.models.guide}));
    this.renderChild(new libs.shelbyGT.OnboardingLayoutView());
  },

  _onChangeDisplayState : function(guideModel, displayState) {

    // try something like views.each(this.hide()) here - only show in switch cases

    switch (displayState){
      case libs.shelbyGT.DisplayState.onboarding:
        this.options.guideOverlay.triggerImmediateHide();
        // show the onboarding layout
        this.$('.js-onboarding-layout').show();
        //pause the video player when obscuring it
        shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.paused);
      break;
      default:
        this.$('.js-onboarding-layout').hide();
    }

  }

});
