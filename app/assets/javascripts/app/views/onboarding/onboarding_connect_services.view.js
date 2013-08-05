libs.shelbyGT.OnboardingConnectServicesView = Support.CompositeView.extend({

  _rollFollowingsIncludingFauxUsers : null,

  events : {
    "click .js-invite-friends"           : "_onInviteFriends",
    "click .js-onboarding-advance-stage" : "_onAdvanceStage",
    "click .js-authorize"                : "_onConnectRemainingService"
  },

  initialize : function(){
    this._rollFollowingsIncludingFauxUsers = new libs.shelbyGT.RollsCollectionModel();

    // if the user has already authenticated facebook, it means we're returning to this stage
    // of onboarding after already having visited the load videos screen, so jump straight
    // to inviting friends from facebook
    if (this.model.get('action') == 'connect' &&
        _(shelby.models.user.get('authentications')).any(function(auth){return auth.provider == 'facebook';})) {
      this.model.set('action', 'invite');
    }

    this.model.bind('change:action', this._onChangeAction, this);
    this.model.bind('change:numFriends', this._onChangeNumFriends, this);
    this.model.bind('change:numVideos', this._onChangeNumVideos, this);
    this.model.bind('change:authFailure', this.render, this);
  },

  _cleanup : function() {
    this.model.unbind('change:action', this._onChangeAction, this);
    this.model.unbind('change:numFriends', this._onChangeNumFriends, this);
    this.model.unbind('change:numVideos', this._onChangeNumVideos, this);
    this.model.unbind('change:authFailure', this.render, this);
  },

  template : function(){

    switch (this.model.get('action')) {
      case 'connect':
        return SHELBYJST['onboarding/onboarding-connect-services']({
          authFailure : this.model.get('authFailure'),
          service : this.model.get('service')
        });
      case 'load':
        return SHELBYJST['onboarding/onboarding-load-service-videos']({
          currentService : this.model.get('service'),
          remainingServices : shelby.models.user.getUnauthedServices()
        });
      case 'invite':
        return SHELBYJST['onboarding/onboarding-invite-friends']({
          remainingServices : shelby.models.user.getUnauthedServices()
        });
    }
  },

  render : function(){
    var self = this;

    this._leaveChildren();

    this.$el.html(this.template());

    _(shelby.config.services.primaryAuth).each(function(service){
      if (_(shelby.models.user.get('authentications')).any(function(auth){return auth.provider == service;})) {
        self.$('.js-authorize--' + service).addClass('disabled').find('.button_label').text('Connected');
      }
    });

    if(this.model.get('action') == 'invite') {
      this.appendChildInto(new libs.shelbyGT.ListView({
        model : this._rollFollowingsIncludingFauxUsers,
        collectionAttribute : 'rolls',
        doStaticRender : false,
        listItemView : libs.shelbyGT.OnboardingInviteFriendItemView
      }),'.js-invite-friends-body');

      this._rollFollowingsIncludingFauxUsers.fetch({
        data : {
          'include_faux' : 1
        }
      });
    }

    return this;
  },

  _onChangeAction : function(model, action) {
    var self = this;

    if (action == 'load') {
      // define callback for what to do afetr we load the roll followings
      var previousNumRollFollowings = [0, 0];
      var rollFollowingFetchAttempt = 1;
      var onRollFollowingsFetched = function(model, response, option){
        var rolls = model.get('rolls');
        var numRollFollowings = rolls.length;
        var friendRollsFromService = rolls.filter(function(roll){
          // count how many rolls I am following that come from the service I just authed with

          // don't count my own rolls
          var isNotOneOfMyRolls = (roll.get('creator_id') != shelby.models.user.id);
          var rollOriginIsService = (roll.get('origin_network') == self.model.get('service'));
          var rollCreatorsIsAuthedWithService = _(roll.get('creator_authentications')).any(function(auth){
            return auth.provider == self.model.get('service');
          });

          return isNotOneOfMyRolls && (rollOriginIsService || rollCreatorsIsAuthedWithService);
        });
        var numFriendRolls = friendRollsFromService.length;

        // if we've found any friends, update the displayed number of friends
        if (numFriendRolls) {
          self.model.set('numFriends', numFriendRolls);
        }

        var recentRollFollowingCounts = _.union(previousNumRollFollowings, [numRollFollowings]);
        if ((!numFriendRolls || recentRollFollowingCounts.length > 1) && rollFollowingFetchAttempt < 10) {
          // if we think there might be more roll followings yet to be created, fetch again
          setTimeout(function(){
            rollFollowingFetchAttempt++;
            previousNumRollFollowings.shift();
            previousNumRollFollowings.push(numRollFollowings);
            self._rollFollowingsIncludingFauxUsers.fetch({
              data : {
                'include_faux' : 1
              },
              success : onRollFollowingsFetched
            });
          }, 500);
        } else {
          this.$('.js-progress-list').children().eq(1).removeClass('load_progress--loading');
          // we now also know how many videos (actaully frames) are available from the friends the user has
          var numVideos = _(friendRollsFromService).reduce(function(count, roll){ return count + roll.get('frame_count'); }, 0);
          // create the illusion that we still have to look up how many videos are available with a timeout
          setTimeout(function(){
            // if we've found any videos, update the view to show how many videos are available
            if (numVideos) {
              self.model.set('numVideos', numVideos);
            }
            self._pollDashboardAndRevealFooter();
          }, 1500);
        }
      };

      // fetch the roll followings so we can find out how many friends the user has on the new service
      this._rollFollowingsIncludingFauxUsers.fetch({
        data : {
          'include_faux' : 1
        },
        success : onRollFollowingsFetched
      });
    }
    this.render();
  },

  // last step of the user experience for this view
  _pollDashboardAndRevealFooter : function() {
    var self = this;

    // we've determined the user has all the roll followings they're going to get, so start polling the dashboard to
    // display the videos that have backfilled into their stream
    // poll a few times in case the backfilling of dashboard entries on the backend is slow
    var dashboardFetchAttempt = 0;
    (function pollLoopFunction(){
      dashboardFetchAttempt++;
      if (dashboardFetchAttempt < 31) {
        shelby.models.dashboard.fetch({
          cache : false,
          data : {
            limit : shelby.config.pageLoadSizes.dashboard
          },
          success : function(){
            setTimeout(pollLoopFunction, 500);
          }
        });
      }
    })();

    // after a delay that makes it feel smooth, reveal the buttons giving the user their choices for
    // their next step
    setTimeout(function(){
      self.$('.js-progress-list').children().eq(2).removeClass('load_progress--loading');
      self.$el.find('.js-modal-foot').removeClass('cloaked');
    }, 2000);

  },

  _onChangeNumFriends : function(model, numFriends) {
    this.$('.js-num-friends').text(numFriends).removeClass('load_progress__total--no_data');
  },

  _onChangeNumVideos : function(model, numVideos) {
    this.$('.js-num-videos').text(numVideos).removeClass('load_progress__total--no_data');
  },

  _onInviteFriends : function() {
    this._checkSetTimelineSharing();
    this.model.set('action', 'invite');
  },

  _onAdvanceStage : function(e){
    var _auths = shelby.models.user.get('authentications') || [];
    if (this.model.get('action') == 'load') {
      this._checkFollowShelby();
    }

    // event tracking
    shelby.trackEx({
      providers : ['ga', 'kmq'],
      gaCategory : "Onboarding",
      gaAction : 'Step 3 Complete',
      gaLabel : shelby.models.user.get('nickname'),
      gaValue : _auths.length,
      kmqName : "Onboarding Step 3 Complete",
      kmqProperties : {
        nickname: shelby.models.user.get('nickname'),
        authenticationsCount : _auths.length
      }
    });
    e.preventDefault();
  },

  _onConnectRemainingService : function(){
    if (this.model.get('action') == 'load') {
      this._checkFollowShelby();
    }
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
