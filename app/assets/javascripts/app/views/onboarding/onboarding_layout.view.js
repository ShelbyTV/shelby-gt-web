libs.shelbyGT.OnboardingLayoutView = Support.CompositeView.extend({

  el: '.js-onboarding-layout',

  template : function(obj){
      return SHELBYJST['onboarding/onboarding-layout'](obj);
  },

  render : function(){
    this.$el.html(this.template());
    this.renderChild(new libs.shelbyGT.OnboardingGuideView());
    this.renderChild(new libs.shelbyGT.OnboardingContentSwitcherView());
  }

});
