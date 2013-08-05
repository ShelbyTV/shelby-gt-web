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
    this.model.bind('onboarding:invite:foundNoFriends', this._onFoundNoFriends, this);
  },

  _cleanup : function() {
    this.model.unbind('change:action', this._onChangeAction, this);
    this.model.unbind('change:numFriends', this._onChangeNumFriends, this);
    this.model.unbind('change:numVideos', this._onChangeNumVideos, this);
    this.model.unbind('change:authFailure', this.render, this);
    this.model.unbind('onboarding:invite:foundNoFriends', this._onFoundNoFriends, this);
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
      // for the invite stage, setup and render a list view
      // showing an item to invite a friend for each facebook-based
      // faux user roll we find

      // fetch the roll followings again so we have maximum chance of discovering some friends to invite
      this._rollFollowingsIncludingFauxUsers.fetch({
        data : {
          'include_faux' : 1
        },
        success : function(model, response) {
          // filter down to only faux user friends from Facebook
          var friendFauxUserRolls = model.get('rolls').filter(function(roll){
            return roll.get('creator_id') != shelby.models.user.id &&
               roll.id != shelby.models.user.get('watch_later_roll_id') &&
               roll.has('creator_authentications') &&
               _(roll.get('creator_authentications')).any(function(auth){return auth.provider == 'facebook';}) &&
               (roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_roll || roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_public);
          });
          if (friendFauxUserRolls.length) {
            // we have some friends to invite, go ahead and render the list of them with invite buttons
            self.appendChildInto(new libs.shelbyGT.ListView({
              collection : new Backbone.Collection(friendFauxUserRolls),
              // show the friends with the most video at the top
              comparator : function(roll) {
                return -roll.get('frame_count');
              },
              doStaticRender : true,
              listItemView : 'OnboardingInviteFriendItemView',
              simulateAddTrue : false
            }), '.js-invite-friends-body');
          } else {
            // we didn't find any friends to invite, notify the view
            self.model.trigger('onboarding:invite:foundNoFriends');
          }
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

  _onFoundNoFriends : function() {
    if (this.model.get('action') == 'invite') {
      // didn't find any friends and we're still on the invite screen
      // append a generic Facebook invite button and the user can choose facebook friends to invite him/herself
      this.$('.js-invite-friends-body').append(SHELBYJST['onboarding/onboarding-generic-facebook-invite-button']);
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
