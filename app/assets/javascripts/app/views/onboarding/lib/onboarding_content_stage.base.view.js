libs.shelbyGT.OnboardingContentStageBaseView = Support.CompositeView.extend({

  className : 'onboarding-content-wrapper',

  template : function(obj){
    return JST['onboarding/onboarding-content-stage-'+this.options.stage](obj);
  },

  render : function(){
    this.$el.html(this.template());
    return this;
  }
});
