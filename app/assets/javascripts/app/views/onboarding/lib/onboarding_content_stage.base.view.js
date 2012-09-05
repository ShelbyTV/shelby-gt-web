libs.shelbyGT.OnboardingContentStageBaseView = Support.CompositeView.extend({

  className : 'onboarding-content-wrapper',

  template : function(obj){
    return JST['onboarding/onboarding-content-stage-'+this.options.stage](obj);
  },

  render : function(){
    console.log('rendering comp view '+this.options.stage);
    this.$el.html(this.template());
    return this;
  }
});
