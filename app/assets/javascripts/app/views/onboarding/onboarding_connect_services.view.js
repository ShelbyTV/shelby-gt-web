libs.shelbyGT.OnboardingConnectServicesView = Support.CompositeView.extend({

  events : {
    "click .js-onboarding-advance-stage" : "_onAdvanceStage"
  },

  initialize : function(){
    this.model.bind('change:action', this._onChangeAction, this);
  },

  _cleanup : function() {
    this.model.unbind('change:action', this._onChangeAction, this);
  },

  template : function(obj){
    if (obj.action == 'connect') {
      return SHELBYJST['onboarding/onboarding-connect-services'](obj);
    } else {
      return SHELBYJST['onboarding/onboarding-load-service-videos'](obj);
    }
  },

  render : function(){
    var self = this;

    this.$el.html(this.template({
      action: this.model.get('action')
    }));

    _(['twitter', 'facebook']).each(function(service){
      if (_(shelby.models.user.get('authentications')).any(function(auth){return auth.provider == service;})) {
        self.$('.js-authorize--' + service).addClass('disabled').find('.button_label').text('Connected');
      }
    });

    return this;
  },

  _onChangeAction : function(model, action) {
    if (action == 'load') {
      shelby.models.dashboard.fetch({
        data : {
          limit : shelby.config.pageLoadSizes.dashboard
        }
      });
    }
    this.render();
  },

  _onAdvanceStage : function(e){
    e.preventDefault();
    if (this.model.get('action') == 'connect') {
      this.model.set('action', 'load');
      e.stopPropagation();
    }
  }

});
