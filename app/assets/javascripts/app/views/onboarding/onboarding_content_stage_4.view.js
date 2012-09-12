libs.shelbyGT.OnboardingContentStage4View = libs.shelbyGT.OnboardingContentStageBaseView.extend({

  /*
   * NOTHING
   * bind to button and navigate
   */
    
    events : {
      "click .js-onboarding-next-step" : "_onNextStepClick"
    },

    _onNextStepClick : function(){
      var appProgress = shelby.models.user.get('app_progress');
      appProgress.set('onboarding', 4);
      appProgress.saveMe();
      shelby.track('completed onboarding',{userName: shelby.models.user.get('nickname')});
      shelby.router.navigate('stream', {trigger:true});
    }

});
