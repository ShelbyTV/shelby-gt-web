libs.shelbyGT.OnboardingContentStageBaseView = Support.CompositeView.extend({

  el : '.js-onboarding-layout .content_lining .content_module',

  initialize : function() {
  },

  _cleanup : function() {
  },

  template : function(obj){
    return JST['onboarding/onboarding-content-stage-'+this.options.stage](obj);
  },

  render : function(){
    console.log('rendering comp view '+this.options.stage);
    this.$el.html(this.template());
    return this;
  }
});
