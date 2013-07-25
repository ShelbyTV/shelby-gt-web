libs.shelbyGT.OnboardingView = Support.CompositeView.extend({

  className: 'content_wrapper onboarding clearfix',

  events : {
    "click .js-onboarding-advance-stage" : "_advanceStage"
  },

  template : function(obj) {
    return SHELBYJST['onboarding/onboarding'](obj);
  },

  initialize : function() {
    shelby.models.guide.bind('change:onboardingStage', this._onOnboardingStageChange, this);

    $('.js-main-layout').after(this.el);
  },

  _cleanup : function() {
    shelby.models.guide.unbind('change:onboardingStage', this._onOnboardingStageChange, this);
  },

  _advanceStage : function() {
    var currentStage = shelby.models.guide.get('onboardingStage');
    if (currentStage == libs.shelbyGT.OnboardingView.numOnboardingStages) {
      shelby.models.user.get('app_progress').advanceStage('onboarding', true);
      shelby.models.guide.set('onboardingStage', null);
      shelby.router.navigate('', {trigger: true, replace: true});
    } else {
      shelby.models.user.get('app_progress').advanceStage('onboarding', currentStage);
      shelby.router.navigate('onboarding/' + (parseInt(currentStage, 10) + 1), {trigger: true, replace: true});
    }
  },

  _onOnboardingStageChange : function(guideModel, stage){
    if (stage) {
      this.render();
    } else {
      this.$el.remove();
    }
  },

  render : function(){
    this._leaveChildren();
    this.$el.html(this.template());
    var stageInfo = libs.shelbyGT.OnboardingView.onboardingStages[shelby.models.guide.get('onboardingStage') - 1];
    var opts = _(stageInfo).result('opts');
    this.appendChildInto(new stageInfo.view(opts), '.js-onboarding-stage-content');
    return this;
  }

});

libs.shelbyGT.OnboardingView.onboardingStages = [
  {
    view : libs.shelbyGT.OnboardingWelcomeView
  },
  {
    view : libs.shelbyGT.OnboardingConnectServicesView,
    opts : function() {
      return {model: shelby.models.onboardingConnectServicesView};
    }
  },
  {
    view : libs.shelbyGT.OnboardingFollowSourcesView,
    opts : function() {
      return {
        model : new libs.shelbyGT.OnboardingFollowSourcesViewModel(),
        rollCategories : shelby.models.onboardingRollCategories
      };
    }
  }
];

libs.shelbyGT.OnboardingView.numOnboardingStages = libs.shelbyGT.OnboardingView.onboardingStages.length;
