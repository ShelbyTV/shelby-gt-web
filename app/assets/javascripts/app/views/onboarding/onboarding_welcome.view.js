libs.shelbyGT.OnboardingWelcomeView = Support.CompositeView.extend({

  events : {
    "click .js-onboarding-advance-stage"  :  "_onAdvanceStage"
  },

  template : function(obj){
    return SHELBYJST['onboarding/onboarding-welcome'](obj);
  },

  render : function(){
    this.$el.html(this.template());
    return this;
  },

  _onAdvanceStage : function(){
    // event tracking
    shelby.trackEx({
      providers : ['ga', 'kmq'],
      gaCategory : "Onboarding",
      gaAction : 'Step 2 Complete',
      gaLabel : shelby.models.user.get('nickname'),
      kmqName : "Onboarding Step 2 Complete",
      kmqProperties : {
        nickname: shelby.models.user.get('nickname')
      }
    });
  }

});
