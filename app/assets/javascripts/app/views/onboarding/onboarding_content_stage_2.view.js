libs.shelbyGT.OnboardingContentStage2View = libs.shelbyGT.OnboardingContentStageBaseView.extend({

  /*
   * SCSS hover buttons
   * <li data-roll_id="23484skdfj4384">
   * .bind(fn(el)el.parent.data('roll_id') etc)
   *
   * Next button should be disabled "follow n more Rolls"
  */

  events : {
    "click .js-onboarding-roll-item-lining:not(.followed)" : "_onOnboardingRollButtonClick",
    "click .js-onboarding-next-step" : "_onNextStepClick"
  },

  initialize : function(){
    this.model.bind('change:rolls_followed', this._onRollsFollwedChange, this);
  },

  cleanup : function(){
    this.model.unbind('change:rolls_followed', this._onRollsFollwedChange, this);
  },

  _onOnboardingRollButtonClick : function(event){
    console.log('not followed?');
    //doing this fire and forget so update state and appearance immediately
    var $roll = $(event.currentTarget);
    var rollId = $roll.data('roll_id');

    this.model.set('rolls_followed', this.model.get('rolls_followed')+1);
    $roll.addClass('followed');

    //then fire off ajax
    var rollToJoin = new libs.shelbyGT.RollModel({id:rollId});
    rollToJoin.joinRoll();
  },

  _onRollsFollwedChange : function(model, rolls_followed){
    if (rolls_followed > 2){
      this.$('.js-onboarding-next-step').text('Next').addClass('onboarding-next-step-highlight');
      this.$('.js-onboarding-follow-more-count').text('some rolls').removeClass('onboarding-follow-more-highlight');
    } else {
      var needToFollowCount = 3 - rolls_followed;
      var newText = 'at least '+(needToFollowCount)+' more '+_('roll').pluralize(needToFollowCount);
      this.$('.js-onboarding-follow-more-count').text(newText).addClass('onboarding-follow-more-highlight');
    }
  },

  _onNextStepClick : function(){
    var appProgress = shelby.models.user.get('app_progress');
    shelby.models.user.get('app_progress').advanceStage('onboarding', 2);
    shelby.router.navigate('onboarding/3', {trigger:true});
  }

});
