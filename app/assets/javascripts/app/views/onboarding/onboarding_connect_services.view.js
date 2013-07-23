libs.shelbyGT.OnboardingConnectServicesView = Support.CompositeView.extend({

  events : {
    "click .js-onboarding-advance-stage" : "_onAdvanceStage"
  },

  template : function(obj){
    return SHELBYJST['onboarding/onboarding-connect-services'](obj);
  },

  render : function(){
    this.$el.html(this.template());
    return this;
  },

  _onAdvanceStage : function(e){
    e.preventDefault();
  }

});
