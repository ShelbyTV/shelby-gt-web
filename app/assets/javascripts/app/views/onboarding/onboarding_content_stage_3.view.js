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
    this._checkFollowShelby();
    this._checkSetTimelineSharing();
    
    var appProgress = shelby.models.user.get('app_progress');
    shelby.models.user.get('app_progress').advanceStage('onboarding', 3);
    shelby.router.navigate('onboarding/4', {trigger:true});
    
    shelby.track('Onboarding step 3 complete', {userName: shelby.models.user.get('nickname')});
  },
  
  _checkFollowShelby : function(){
    if(_(shelby.models.user.get('authentications')).any(function(auth){return auth.provider == 'twitter';})) {
      if($('.js-onboarding-follow-shelby').is(':checked')) {
        //TODO make this an actual model subclass if we need to do this anywhere else in the app
        var userToFollow = new libs.shelbyGT.ShelbyBaseModel();
        userToFollow.url = shelby.config.apiRoot + '/twitter/follow/shelby';
        userToFollow.save();
        shelby.track('Follow Shelby', {userName: shelby.models.user.get('nickname')});
        
      }
    }
  },

  _checkSetTimelineSharing : function(){
    if(_(shelby.models.user.get('authentications')).any(function(auth){return auth.provider == 'facebook';})) {
      var _prefs = _.clone(shelby.models.user.get('preferences'));
      _prefs['open_graph_posting'] = $('#onboarding-timeline-sharing').is(':checked') ? true : false;
      shelby.models.user.save({preferences: _prefs});
      shelby.track('FB Timeline App Preference set to '+_prefs['open_graph_posting'],{userName: shelby.models.user.get('nickname')});
    }
  }

});
