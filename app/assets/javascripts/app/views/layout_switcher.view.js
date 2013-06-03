libs.shelbyGT.LayoutSwitcherView = Support.CompositeView.extend({

  el: '.js-shelby-wrapper',

  initialize : function() {
    this.model.bind('change:displayState', this._onChangeDisplayState, this);
    this.render();
  },

  _cleanup : function() {
    this.model.unbind('change:displayState', this._onChangeDisplayState, this);
  },

  render : function(){
    this.renderChild(new libs.shelbyGT.AppHeaderView({
      model: shelby.models.user,
      guide: shelby.models.guide
    }));
    this.renderChild(new libs.shelbyGT.MainLayoutView({
      model: shelby.models.guide
    }));

    this.renderChild(new libs.shelbyGT.UserPreferencesView({
      model: shelby.models.user,
      viewModel: shelby.models.userPreferencesView,
      section: libs.shelbyGT.UserPreferencesViewModel.section
    }));
  },

  _onChangeDisplayState : function(guideModel, displayState) {
    switch (displayState){
      case libs.shelbyGT.DisplayState.userPreferences:
        this.options.guideOverlay.triggerImmediateHide();
        // show the preferences layout
        this.$('.js-preferences-layout').toggleClass('hidden',false);
        //pause the video player when obscuring it
        shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.paused);
      break;
      default:
        this.$('.js-preferences-layout').toggleClass('hidden',true);
    }
  }
});
