libs.shelbyGT.OnboardingFollowSourcesView = Support.CompositeView.extend({

  events : {
    "click .js-onboarding-advance-stage"             : "_onAdvanceStage"
  },

  template : function(obj){
    return SHELBYJST['onboarding/onboarding-follow-sources'](obj);
  },

  initialize : function(){
    this.options.rollCategories.fetch();

    this.model.bind('change:rolls_followed', this._onRollsFollowedChange, this);
    this.options.rollCategories.get('roll_categories').bind('reset', this.render, this);
  },

  cleanup : function(){
    this.model.unbind('change:rolls_followed', this._onRollsFollowedChange, this);
    this.options.rollCategories.get('roll_categories').unbind('reset', this.render, this);
  },

  render : function(){
    this.$el.html(this.template());

    var _rollCategories = [];
    if (this.options.rollCategories && this.options.rollCategories.get('roll_categories').models.length > 0 && this.options.rollCategories.get('roll_categories').models[0].has('rolls')){
      _rollCategories = this.options.rollCategories.get('roll_categories').models[0].get('rolls').models;

      this.appendChildInto(new libs.shelbyGT.FollowSourcesView({
        clickableUser : false,
        context : 'Onboarding',
        model : this.model,
        pollDashboardAfterFollow : true,
        rollCategories : _rollCategories
      }), '.js-list-sources--onboarding');
    }


    return this;
  },

  _onRollsFollowedChange : function(model, rolls_followed){
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

  _onAdvanceStage : function(e){
    // if we're still polling the dashboard we can stop now
    this.model.trigger("polling:stop");

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
