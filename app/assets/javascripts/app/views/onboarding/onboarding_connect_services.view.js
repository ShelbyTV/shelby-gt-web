libs.shelbyGT.OnboardingConnectServicesView = Support.CompositeView.extend({

  events : {
    "click .js-onboarding-advance-stage" : "_onAdvanceStage"
  },

  initialize : function(){
    this.model.bind('change:action', this._onChangeAction, this);
    this.model.bind('change:numFriends', this._onChangeNumFriends, this);
    this.model.bind('change:numVideos', this._onChangeNumVideos, this);
  },

  _cleanup : function() {
    this.model.unbind('change:action', this._onChangeAction, this);
    this.model.unbind('change:numFriends', this._onChangeNumFriends, this);
    this.model.unbind('change:numVideos', this._onChangeNumVideos, this);
  },

  template : function(){
    if (this.model.get('action') == 'connect') {
      return SHELBYJST['onboarding/onboarding-connect-services']();
    } else {
      return SHELBYJST['onboarding/onboarding-load-service-videos']({
        currentService : this.model.get('service'),
        otherService : this.model.get('service') == 'facebook' ? 'twitter' : 'facebook'
      });
    }
  },

  render : function(){
    var self = this;

    this.$el.html(this.template());

    _(['twitter', 'facebook']).each(function(service){
      if (_(shelby.models.user.get('authentications')).any(function(auth){return auth.provider == service;})) {
        self.$('.js-authorize--' + service).addClass('disabled').find('.button_label').text('Connected');
      }
    });

    return this;
  },

  _onChangeAction : function(model, action) {
    var self = this;

    if (action == 'load') {
      // fetch the roll followings so we can find out how many friends the user has on the new service
      shelby.models.rollFollowings.fetch({
        success : function(model, response, option){
          // todo: keep loading the rollfollowings until the number stabilizes
          self.model.set('numFriends', model.get('rolls').length);
          // we now also know how many videos (actaully frames) are available from the friends the user has
          var numVideos = model.get('rolls').reduce(function(count, roll){ return count + roll.get('frame_count'); }, 0);
          // create the illusion that we still have to look up how many videos are available with a timeout
          setTimeout(function(){
            // update the view to show how many videos are available
            self.model.set('numVideos', numVideos);
            // now fetch the actual found videos from the dashboard and show them in the guide
              shelby.models.dashboard.fetch({
                data : {
                  limit : shelby.config.pageLoadSizes.dashboard
                }
              });
          }, 2000);
        }
      });
    }
    this.render();
  },

  _onChangeNumFriends : function(model, numFriends) {
    this.$('.js-num-friends').text(numFriends);
    this.$('.js-progress-list').children().eq(1).removeClass('load_progress--loading');
  },

  _onChangeNumVideos : function(model, numVideos) {
    this.$('.js-num-videos').text(numVideos);
    this.$('.js-progress-list').children().eq(2).removeClass('load_progress--loading');
  },

  _onAdvanceStage : function(e){
    e.preventDefault();
  }

});
