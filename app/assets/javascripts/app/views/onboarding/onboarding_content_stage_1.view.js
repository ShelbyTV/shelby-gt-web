libs.shelbyGT.OnboardingContentStage1View = Support.CompositeView.extend({

  el : '.js-onboarding-layout .content_lining',

  initialize : function() {
  },

  _cleanup : function() {
  },

  template : function(obj){
    return JST['onboarding-content-stage-1'](obj);
  },

  render : function(){
    console.log('rendering comp view 1');
    this.$el.html(this.template());
    return this;
  }
});
