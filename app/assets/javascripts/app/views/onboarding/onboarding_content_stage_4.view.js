libs.shelbyGT.OnboardingContentStage4View = libs.shelbyGT.OnboardingContentStageBaseView.extend({

  /*
   * NOTHING
   * bind to button and navigate
   */
    
    events : {
      "click .js-onboarding-next-step" : "_onNextStepClick"
    },

    _onNextStepClick : function(){
      shelby.router.navigate('stream', {trigger:true});
    }

});
