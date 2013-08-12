libs.shelbyGT.OnboardingGuideEmptyIndicatorView = Support.CompositeView.extend({

  tagName : 'li',

  template : function(obj){
    return SHELBYJST['onboarding-guide-empty-indicator'](obj);
  },

  render : function(){
    this.$el.html(this.template());
  }

});
