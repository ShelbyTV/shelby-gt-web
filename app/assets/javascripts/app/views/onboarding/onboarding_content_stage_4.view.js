libs.shelbyGT.OnboardingContentStage4View = libs.shelbyGT.OnboardingContentStageBaseView.extend({

  /*
   * NOTHING
   * bind to button and navigate
   */
    
    // _animationInterval : null,

    events : {
      "click .js-onboarding-next-step" : "_onNextStepClick"
    },

    // _cleanup : function() {
    //   if (this._animationInterval) {
    //     clearInterval(this._animationInterval);
    //   }
    // },

    render : function(){
      // if (this._animationInterval) {
      //   clearInterval(this._animationInterval);
      // }
      this.$el.html(this.template({user: shelby.models.user}));
      // this._animationInterval = setInterval(_.bind(this._showNextSlide, this), 3000);
      return this;
    },

    _onNextStepClick : function(){
      var appProgress = shelby.models.user.get('app_progress');
      shelby.models.user.get('app_progress').advanceStage('onboarding', 4);
      shelby.track('completed onboarding',{userName: shelby.models.user.get('nickname')});
      shelby.models.guide.set('onboardingStage', null);
      shelby.router.navigate('stream', {trigger:true});
    }

    // _showNextSlide : function(){
    //   var $nextSibling = this.$('.onboarding-stage-4-slide-shown').removeClass('onboarding-stage-4-slide-shown').next();
    //   if (!$nextSibling.length) {
    //     $nextSibling = this.$('.onboarding-stage-4-slide:first');
    //   }
    //   $nextSibling.addClass('onboarding-stage-4-slide-shown');
    // }

});
