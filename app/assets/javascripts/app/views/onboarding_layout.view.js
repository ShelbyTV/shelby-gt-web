libs.shelbyGT.OnboardingLayoutView = Support.CompositeView.extend({

  el: '.js-onboarding-layout',

  _spinnerView : null,

  _spinnerState : null,

  template : function(obj){
      return JST['onboarding-layout'](obj);
  },

  initialize : function(){
  },

  _cleanup : function(){
  },

  render : function(){
    this.$el.html(this.template());
    this.renderChild(new libs.shelbyGT.OnboardingGuideView());
    this.renderChild(new libs.shelbyGT.OnboardingContentSwitcherView());
  },

  _onShowSpinner : function() {
    this._spinnerState.set('show', true);
  },

  _onHideSpinner : function() {
    this._spinnerState.set('show', false);
  }

});
