libs.shelbyGT.OnboardingView = Support.CompositeView.extend({

  className: 'content_wrapper onboarding clearfix',

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
        };
      }
    },
    '2' : {
      view:libs.shelbyGT.OnboardingContentStage2View,
      opts:function(){
        return {
          model: new libs.shelbyGT.OnboardingStage2Model(),
          rollCategories: shelby.models.onboardingRollCategories,
          stage: 2
        };
      }
    }
  },

  render : function(){
    this._leaveChildren();
    this.$el.html(this.template());
    //problem is that leaving child deletes the container?
    var stage = shelby.models.guide.get('onboardingStage');
    if (stage===null) return false;
    var opts = (typeof this._stageToChildMap[stage].opts==='function') ? this._stageToChildMap[stage].opts() : this._stageToChildMap[stage].opts;
    //this.renderChild(new this._stageToChildMap[stage].view(opts));
    this.appendChild(new this._stageToChildMap[stage].view(opts));
    return this;
  }

});
