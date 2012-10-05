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
    this._setTimelineSharing();
    
    var appProgress = shelby.models.user.get('app_progress');
    shelby.models.user.get('app_progress').advanceStage('onboarding', 3);
    shelby.router.navigate('onboarding/4', {trigger:true});
    
    shelby.track('Onboarding step 3 complete', {userName: shelby.models.user.get('nickname')});
  },
  
  _setTimelineSharing : function(){
    var _prefs = _.clone(shelby.models.user.get('preferences'));
    _prefs['open_graph_posting'] = $('#onboarding-timeline-sharing').is(':checked') ? true : false;
    shelby.models.user.save({preferences: _prefs});
  }

});
