libs.shelbyGT.OnboardingContentSwitcherView = Support.CompositeView.extend({

  el : '.js-onboarding-layout .content_lining .content_module',

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
      opts:function(){
        return {
          model: new libs.shelbyGT.OnboardingStage1Model(),
          stage: 1
        }
      }
    },
    '2' : {
      view:libs.shelbyGT.OnboardingContentStage2View,
      opts:function(){
        return {
          model: new libs.shelbyGT.OnboardingStage2Model(),
          stage: 2
        }
      }
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
    //problem is that leaving child deletes the container?
    var stage = shelby.models.guide.get('onboardingStage');
    if (stage===null) return false;
    console.log('STAGE', stage, this._stageToChildMap[stage]);
    var opts = (typeof this._stageToChildMap[stage].opts==='function') ?this._stageToChildMap[stage].opts() : this._stageToChildMap[stage].opts;
    //this.renderChild(new this._stageToChildMap[stage].view(opts));
    this.appendChild(new this._stageToChildMap[stage].view(opts));
    return this;
  }

});
