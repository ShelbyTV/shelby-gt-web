libs.shelbyGT.OnboardingConnectServicesView = Support.CompositeView.extend({

  events : {
    "click .js-onboarding-advance-stage" : "_onAdvanceStage"
  },

  initialize : function(){
    this.model.bind('change:action', this.render, this);
  },

  _cleanup : function() {
    this.model.unbind('change:action', this.render, this);
  },

  template : function(obj){
    if (obj.action == 'connect') {
      return SHELBYJST['onboarding/onboarding-connect-services'](obj);
    } else {
      return SHELBYJST['onboarding/onboarding-load-service-videos'](obj);
    }
  },

  render : function(){
    this.$el.html(this.template({
      action: this.model.get('action')
    }));
    return this;
  },

  _onAdvanceStage : function(e){
    e.preventDefault();
    if (this.model.get('action') == 'connect') {
      this.model.set('action', 'load');
      e.stopPropagation();
    }
  }

});
