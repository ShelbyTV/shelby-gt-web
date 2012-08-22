libs.shelbyGT.OnboardingLayoutView = Support.CompositeView.extend({

  el: '.js-onboarding-layout',

  _spinnerView : null,

  _spinnerState : null,

  template : function(obj){
      return JST['onboarding-layout'](obj);
  },

  initialize : function(){
    shelby.models.exploreGuide.bind('showSpinner', this._onShowSpinner, this);
    shelby.models.exploreGuide.bind('hideSpinner', this._onHideSpinner, this);
  },

  _cleanup : function(){
    shelby.models.exploreGuide.unbind('showSpinner', this._onShowSpinner, this);
    shelby.models.exploreGuide.unbind('hideSpinner', this._onHideSpinner, this);
  },

  render : function(){
    this.$el.html(this.template());
    this.renderChild(new libs.shelbyGT.OnboardingGuideView());
    this._spinnerState = new libs.shelbyGT.SpinnerStateModel();
    this._spinnerView = new libs.shelbyGT.SpinnerView({
      model : this._spinnerState,
      el : '.js-guide-explore',
      size : 'explore'
    });
    this.renderChild(this._spinnerView);
  },

  _onShowSpinner : function() {
    this._spinnerState.set('show', true);
  },

  _onHideSpinner : function() {
    this._spinnerState.set('show', false);
  }

});
