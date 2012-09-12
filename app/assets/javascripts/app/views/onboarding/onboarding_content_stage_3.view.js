libs.shelbyGT.OnboardingContentStage3View = libs.shelbyGT.OnboardingContentStageBaseView.extend({
  /*
   * pop up new window
   * auth -> api redirects to onboarding/3
   * .jst looks at user.get('authentications') and renders shit
   * no validation - can skip
   */
   
   events : {
     "click .js-onboarding-next-step" : "_onNextStepClick"
   },

   _onNextStepClick : function(){
     var appProgress = shelby.models.user.get('app_progress');
     appProgress.set('onboarding', 3);
     appProgress.saveMe();
     shelby.router.navigate('onboarding/4', {trigger:true});
   }

});
