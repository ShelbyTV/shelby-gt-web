libs.shelbyGT.OnboardingGuideView = libs.shelbyGT.ListItemView.extend({

  el : '.js-onboarding-guide',

  initialize : function() {
    shelby.models.guide.bind('change:onboardingStage', this._onOnboardingStageChange, this);
  },

  _cleanup : function() {
    shelby.models.guide.unbind('change:onboardingStage', this._onOnboardingStageChange, this);
  },

  template : function(obj){
    return JST['onboarding/onboarding-guide'](obj);
  },

  _onOnboardingStageChange : function(guideModel, stage){
    this.render();
  },

  render : function(){
    this.$el.html(this.template({stage:shelby.models.guide.get('onboardingStage')}));
    return this;
  }
});
