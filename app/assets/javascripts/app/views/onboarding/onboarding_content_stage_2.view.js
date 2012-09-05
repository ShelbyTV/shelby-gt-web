libs.shelbyGT.OnboardingContentStage2View = libs.shelbyGT.OnboardingContentStageBaseView.extend({

  /*
   * SCSS hover buttons
   * <li data-roll_id="23484skdfj4384">
   * .bind(fn(el)el.parent.data('roll_id') etc)
   *
   * Next button should be disabled "follow n more Rolls"
  */

  events : {
    "click .js-onboarding-roll-list-item-button" : "_onOnboardingRollButtonClick",
    "click .js-onboarding-next-step" : "_onNextStepClick"
  },

  _onOnboardingRollButtonClick : function(event){
    console.log('following roll', event.currentTarget.id);
    var rollToJoin = new libs.shelbyGT.RollModel({id:event.currentTarget.id});
    rollToJoin.joinRoll(this._onRollFollowSuccess);
  },

  _onRollFollowSuccess : function(){
    this.$('.js-onboarding-roll-item-lining').addClass('followed');
  },

  _onNextStepClick : function(){
    shelby.router.navigate('onboarding/3', {trigger:true});
  }

});
