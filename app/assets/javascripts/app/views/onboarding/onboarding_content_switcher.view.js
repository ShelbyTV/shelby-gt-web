libs.shelbyGT.OnboardingContentSwitcherView = Support.CompositeView.extend({

  initialize : function() {
    shelby.models.guide.bind('change:onboardingStage', this._onOnboardingStageChange, this);
  },

  _cleanup : function() {
    shelby.models.guide.unbind('change:onboardingStage', this._onOnboardingStageChange, this);
  },

  _onOnboardingStageChange : function(guideModel, stage){
    this.render();
  },

  _stageToChildMap : {
    '1' : {
      view:libs.shelbyGT.OnboardingContentStage1View,
      opts:{stage:1}
    },
    '2' : {
      view:libs.shelbyGT.OnboardingContentStage2View,
      opts:{stage:2}
    },
    '3' : {
      view:libs.shelbyGT.OnboardingContentStage3View,
      opts:{stage:3}
    },
    '4' : {
      view:libs.shelbyGT.OnboardingContentStage4View,
      opts:{stage:4}
    }
  },
  

  render : function(){
    this._leaveChildren();
    var stage = shelby.models.guide.get('onboardingStage');
    if (stage===null) return false;
    console.log('STAGE', stage, this._stageToChildMap[stage]);
    this.renderChild(new this._stageToChildMap[stage].view(this._stageToChildMap[stage].opts));
    return this;
  }

});
