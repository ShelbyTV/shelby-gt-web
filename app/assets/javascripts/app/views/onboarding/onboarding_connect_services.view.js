libs.shelbyGT.OnboardingConnectServicesView = Support.CompositeView.extend({

  events : {
    "click .js-onboarding-advance-stage" : "_onAdvanceStage"
  },

  initialize : function(){
    _.bind(this._onRollFollowingsFetched, this);
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
      // the view will display a button to authorize with more services if
      // the user hasn't already connected them, so first figure out which
      // eligible services the user hasn't connected yet
      var userAuthentications = shelby.models.user.get('authentications');
      var remainingServices;
      if (userAuthentications && userAuthentications.length) {
        remainingServices = _(shelby.config.services.primaryAuth).reject(function(service){
          return _(userAuthentications).any(function(auth){
            return auth.provider == service;
          });
        });
      } else {
        remainingServices = shelby.config.services.primaryAuth;
      }

      return SHELBYJST['onboarding/onboarding-load-service-videos']({
        currentService : this.model.get('service'),
        remainingServices : remainingServices
      });
    }
  },

  render : function(){
    var self = this;

    this.$el.html(this.template());

    _(shelby.config.services.primaryAuth).each(function(service){
      if (_(shelby.models.user.get('authentications')).any(function(auth){return auth.provider == service;})) {
        self.$('.js-authorize--' + service).addClass('disabled').find('.button_label').text('Connected');
      }
    });

    return this;
  },

  _onChangeAction : function(model, action) {
    var self = this;

    if (action == 'load') {
      // define callback for what to do afetr we load the roll followings
      var previousNumFriendRolls = 0;
      var fetchAttempt = 1;
      var onRollFollowingsFetched = function(model, response, option){
        var friendRollsFromService = model.get('rolls').filter(function(roll){
          return (roll.get('creator_id') != shelby.models.user.id &&
                  (roll.get('origin_network') == self.model.get('service')) ||
                  (_(roll.get('creator_authentications')).any(function(auth){
                    return auth.provider == self.model.get('service');
                  }))
                 );
        });
        var numFriendRolls = friendRollsFromService.length;

        if ((!numFriendRolls || numFriendRolls != previousNumFriendRolls) && fetchAttempt < 5) {
          // if we think there might be more roll followings yet to be created, fetch again
          fetchAttempt++;
          previousNumFriendRolls = numFriendRolls;
          console.log('fetching again');
          shelby.models.rollFollowings.fetch({
            success : onRollFollowingsFetched
          });
        } else {
          setTimeout(function(){
            // otherwise, update the displayed number of friends found with video and move on
            self.model.set('numFriends', numFriendRolls);

            // we now also know how many videos (actaully frames) are available from the friends the user has
            var numVideos = _(friendRollsFromService).reduce(function(count, roll){ return count + roll.get('frame_count'); }, 0);
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

              setTimeout(function(){
                self.$el.find('.js-modal-foot').removeClass('cloaked');
              }, 2000);
            }, 3250);
          }, 1000);
        }
      };
      console.log('first fetch');

      // fetch the roll followings so we can find out how many friends the user has on the new service
      shelby.models.rollFollowings.fetch({
        success : onRollFollowingsFetched
      });
    }
    this.render();
  },

  _onRollFollowingsFetched : function(model, response, option) {
    console.log('fetched', this);
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
    // event tracking
    shelby.trackEx({
      providers : ['ga', 'kmq'],
      gaCategory : "Onboarding",
      gaAction : 'Step 3 Complete',
      gaLabel : shelby.models.user.get('nickname'),
      gaValue : shelby.models.user.get('authentications').length,
      kmqName : "Onboarding Step 4 Complete",
      kmqProperties : {
        nickname: shelby.models.user.get('nickname'),
        authenticationsCount : shelby.models.user.get('authentications').length
      }
    });
    e.preventDefault();
  }

});
