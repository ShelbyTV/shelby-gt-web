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

  initialize : function(){
    this.model.bind('change:rolls_followed', this._onRollsFollwedChange, this);
  },

  cleanup : function(){
    this.model.unbind('change:rolls_followed', this._onRollsFollwedChange, this);
  },

  _onOnboardingRollButtonClick : function(event){
    var rollId = event.currentTarget.id;
    var rollToJoin = new libs.shelbyGT.RollModel({id:rollId});
    var self = this;
    rollToJoin.joinRoll(function(){
      self.model.set('rolls_followed', self.model.get('rolls_followed')+1);
      $('#js-roll-item-lining-'+rollId).addClass('followed');
    });
  },

  _onRollsFollwedChange : function(model, rolls_followed){
    if (rolls_followed > 2){
      this.$('.js-onboarding-next-step').text('Next').removeAttr('disabled');
    } else {
      var noun = rolls_followed===2 ? 'Roll' : 'Rolls';
      this.$('.js-onboarding-next-step').text('Follow '+(3-this.model.get('rolls_followed'))+' more '+noun);
    }
  },

  _onNextStepClick : function(){
    var appProgress = shelby.models.user.get('app_progress');
    appProgress.set('onboarding', 2);
    appProgress.saveMe();
    shelby.router.navigate('onboarding/3', {trigger:true});
  }

});
