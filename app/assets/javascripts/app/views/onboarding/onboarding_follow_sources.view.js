libs.shelbyGT.OnboardingFollowSourcesView = Support.CompositeView.extend({

  events : {
    "click .js-onboarding-roll-button:not(.js-busy)" : "_follow",
    "click .js-onboarding-advance-stage"             : "_onAdvanceStage"
  },

  template : function(obj){
    return SHELBYJST['onboarding/onboarding-follow-sources'](obj);
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
    var _rollCategories = [];
    if (this.options.rollCategories && this.options.rollCategories.get('roll_categories').models.length > 0 && this.options.rollCategories.get('roll_categories').models[0].has('rolls')){
      _rollCategories = this.options.rollCategories.get('roll_categories').models[0].get('rolls').models;
    }

    this.$el.html(this.template({rollCategories: _rollCategories}));
    return this;
  },

  _onRollsFollwedChange : function(model, rolls_followed){
    var $button = this.$('.js-onboarding-advance-stage');

    if (rolls_followed > 2){
      $button.text('Start Watching')
             .toggleClass('disabled',false)
             .removeAttr('disabled');
    } else {
      var needToFollowCount = 3 - rolls_followed;
      var newText = 'Follow '+(needToFollowCount) + ' More';

      $button.text(newText);
    }
  },

  _follow : function(e){
    var $thisButton = $(e.currentTarget);

    // immediately toggle the button - if the ajax fails, we'll update the next time we render
    var isFollowed = $thisButton.text('Following').toggleClass('button_enabled visuallydisabled').hasClass('visuallydisabled');
    var notFollowed = !isFollowed;
    // even though the inverse action is now described by the button, we prevent click handling
    // with class js-busy until the ajax completes
    $thisButton.addClass('js-busy');

    // now that we've told the user that their action has succeeded, let's fire off the ajax to
    // actually do what they want, which will very likely succeed
    var clearBusyFunction = function() {
      $thisButton.removeClass('js-busy');
    };

    var thisRoll = new libs.shelbyGT.RollModel({id: $thisButton.data('roll_id')});

    if (notFollowed) {
      e.preventDefault();
    }
    else {
      this.model.set('rolls_followed', this.model.get('rolls_followed')+1);
      thisRoll.joinRoll(clearBusyFunction, clearBusyFunction);
    }
  },

  _onAdvanceStage : function(e){
// event tracking
    shelby.trackEx({
      providers : ['ga', 'kmq'],
      gaCategory : "Onboarding",
      gaAction : 'Step 4 Complete',
      gaLabel : shelby.models.user.get('nickname'),
      gaValue : this.model.get('rolls_followed'),
      kmqName : "Onboarding Step 4 Complete",
      kmqProperties : {
        nickname: shelby.models.user.get('nickname'),
        rollsFollowed : this.model.get('rolls_followed')
      }
    });
  }
});
