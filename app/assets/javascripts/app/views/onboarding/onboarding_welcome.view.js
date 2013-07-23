libs.shelbyGT.OnboardingWelcomeView = Support.CompositeView.extend({

  template : function(obj){
    return SHELBYJST['onboarding/onboarding-welcome'](obj);
  },

  events : {
    "click .js-onboarding-advance-stage.do-cancel" : "_advanceStageDoCancel",
    "click .js-onboarding-advance-stage.dont-cancel" : "_advanceStageDontCancel"
  },

  render : function(){
    this.$el.html(this.template());
    return this;
  },

  _advanceStageDontCancel : function(e){
    console.log("Clicked me advance");
  },

  _advanceStageDoCancel : function(e){
   console.log("Clicked me don't advance");
   e.stopPropagation();
  }

});
