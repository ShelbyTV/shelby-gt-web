libs.shelbyGT.OnboardingContentStage2View = libs.shelbyGT.OnboardingContentStageBaseView.extend({

  /*
   * SCSS hover buttons
   * <li data-roll_id="23484skdfj4384">
   * .bind(fn(el)el.parent.data('roll_id') etc)
   *
   * Next button should be disabled "follow n more Rolls"
  */

  /* Where does the content come from?
   * --> We are using RollCategoriesCollectionModel to fetch featured rolls from the API
   *
   * To update the content, see shelby_gt/config/settings/roll.yml (which gets returned via
   * /v1/roll/featured)
   */

  events : {
    "click .js-onboarding-roll-button:not(.js-busy)" : "_followOrUnfollow",
    "click .js-onboarding-next-step" : "_onNextStepClick"
  },

  initialize : function(){
    this.options.rollCategories.fetch();

    this.model.bind('change:rolls_followed', this._onRollsFollwedChange, this);
    this.options.rollCategories.get('roll_categories').bind('reset', this.render, this);
  },

  cleanup : function(){
    this.model.unbind('change:rolls_followed', this._onRollsFollwedChange, this);
    this.options.rollCategories.get('roll_categories').unbind('reset', this.render, this);
  },

  render : function(){
    this.$el.html(this.template({rollCategories: this.options.rollCategories}));
    return this;
  },

  _onRollsFollwedChange : function(model, rolls_followed){
    var $button = this.$('.js-start-watching');

    if (rolls_followed > 2){
      $button.text('Start Watching')
             .toggleClass('button_default disbaled',false)
             .toggleClass('button_green',true);
    } else {
      var needToFollowCount = 3 - rolls_followed;
      var newText = 'Follow '+(needToFollowCount)+' more '+_('Roll').pluralize(needToFollowCount);

      $button.text(newText);
    }
  },

  _onNextStepClick : function(){
    var appProgress = shelby.models.user.get('app_progress');

    shelby.models.user.get('app_progress').advanceStage('onboarding', 2);
    shelby.router.navigate('onboarding/3', {trigger:true});

    shelby.track('Onboarding step 2 complete', {userName: shelby.models.user.get('nickname')});
  },

  _followOrUnfollow : function(e){
    var $thisButton = $(e.currentTarget);

    // immediately toggle the button - if the ajax fails, we'll update the next time we render
    var isFollowed = $thisButton.toggleClass('button_green').toggleClass('button_default').hasClass('button_green');
    var wasFollowed = !isFollowed;
    // even though the inverse action is now described by the button, we prevent click handling
    // with class js-busy until the ajax completes
    $thisButton.addClass('js-busy');

    // now that we've told the user that their action has succeeded, let's fire off the ajax to
    // actually do what they want, which will very likely succeed
    var clearBusyFunction = function() {
      $thisButton.removeClass('js-busy');
    };

    var thisRoll = new libs.shelbyGT.RollModel({id: $thisButton.data('roll_id')});

    if (wasFollowed) {
      this.model.set('rolls_followed', this.model.get('rolls_followed')-1);
      thisRoll.leaveRoll(clearBusyFunction, clearBusyFunction);
    } else {
      this.model.set('rolls_followed', this.model.get('rolls_followed')+1);
      thisRoll.joinRoll(clearBusyFunction, clearBusyFunction);
    }
  }
});
