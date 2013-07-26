libs.shelbyGT.OnboardingConnectServicesView = Support.CompositeView.extend({

  events : {
    "click .js-onboarding-advance-stage" : "_onAdvanceStage",
    "click .js-authorize" : "_onConnectRemainingService"
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

      // fetch the roll followings so we can find out how many friends the user has on the new service
      shelby.models.rollFollowings.fetch({
        success : onRollFollowingsFetched
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
    var _auths = shelby.models.user.get('authentications') ? shelby.models.user.get('authentications') : [];
    if (this.model.get('action') == 'load') {
      this._checkFollowShelby();
      this._checkSetTimelineSharing();
    }

    // event tracking
    shelby.trackEx({
      providers : ['ga', 'kmq'],
      gaCategory : "Onboarding",
      gaAction : 'Step 3 Complete',
      gaLabel : shelby.models.user.get('nickname'),
      gaValue : _auths.length,
      kmqName : "Onboarding Step 4 Complete",
      kmqProperties : {
        nickname: shelby.models.user.get('nickname'),
        authenticationsCount : _auths.length
      }
    });
    e.preventDefault();
  },

  _onConnectRemainingService : function(){
    this._checkFollowShelby();
    this._checkSetTimelineSharing();
  },

  _checkFollowShelby : function(){
    // if we just authenticated twitter
    if(this.model.get('service') == 'twitter' &&
       _(shelby.models.user.get('authentications')).any(function(auth){return auth.provider == 'twitter';})) {
      // if the user checked the box to do so
      if(this.$('#onboarding-follow-shelby').is(':checked')) {
        // make the user follow Shelby on twitter
        // TODO make this an actual model subclass if we need to do this anywhere else in the app
        var userToFollow = new libs.shelbyGT.ShelbyBaseModel();
        userToFollow.url = shelby.config.apiRoot + '/twitter/follow/shelby';
        userToFollow.save();
        shelby.track('Follow Shelby', {userName: shelby.models.user.get('nickname')});
      }
    }
  },

  _checkSetTimelineSharing : function(){
    // if we just authenticated facebook, update the user's timeline sharing preference
    if (this.model.get('service') == 'facebook') {
      var _prefs = _.clone(shelby.models.user.get('preferences'));
      _prefs['open_graph_posting'] = this.$('#onboarding-timeline-sharing').is(':checked');
      shelby.models.user.save({preferences: _prefs});
      shelby.track('FB Timeline App Preference set to '+_prefs['open_graph_posting'],{userName: shelby.models.user.get('nickname')});
    }
  }

});
