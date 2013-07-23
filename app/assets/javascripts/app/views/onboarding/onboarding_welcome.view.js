libs.shelbyGT.OnboardingWelcomeView = Support.CompositeView.extend({

  template : function(obj){
    return SHELBYJST['onboarding/onboarding-welcome'](obj);
  },

  render : function(){
    this.$el.html(this.template());
    return this;
  }

});
