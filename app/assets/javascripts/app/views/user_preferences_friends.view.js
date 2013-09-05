libs.shelbyGT.UserPreferencesFriendsView = libs.shelbyGT.UserPreferencesBaseView.extend({

  _baseURL : 'http://shelby.tv/signup/',

  events : {
    'click .js-facebook-post' : '_shareToFacebook'
  },

  className: 'content_lining preferences_page preferences_page--friends',

  options : _.extend({}, libs.shelbyGT.UserPreferencesBaseView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-friends'](obj);
  },

  render : function(){
    var self = this;

    this._userId = shelby.models.user.get('id');

    this.options.rollFollowings.fetch({
        data : {
          'include_faux' : 1
        },
        success : function(model, response) {
          // filter down to only faux user friends from Facebook
          var friendFauxUserRolls = model.get('rolls').filter(function(roll){
            return roll.get('creator_id') != shelby.models.user.id &&
               roll.id != shelby.models.user.get('watch_later_roll_id') &&
               roll.has('creator_authentications') &&
               _(roll.get('creator_authentications')).any(function(auth){ return auth.provider == 'facebook';}) &&
               (roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_roll || roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_public);
          });
          // notify the view of the friends we found
          self.model.trigger('onboarding:invite:fetchedFriends', friendFauxUserRolls);
        }
      });

    var data = {
      shareURL : this._buildShareUrl(this._userId),
      tweetURL : this._buildTweetUrl(this._userId),
      facebookConnected : this._facebookConnected
		};

    this.$el.html(this.template(data));

  },

  initialize : function(){
    this._facebookConnected = _(shelby.models.user.get('authentications')).any(function(auth){ return auth.provider == 'facebook'; });
    this.model.bind('onboarding:invite:fetchedFriends', this._onFetchedFriends, this);
  },

  _cleanup : function(){
    this.model.unbind('onboarding:invite:fetchedFriends', this._onFetchedFriends, this);
  },

  _buildTweetUrl : function() {

    var tweetUrl     = this._baseURL + this._userId,
        tweetMessage = "I'm watching my perfect video stream on @Shelby. Join me and get yours.",
        url          = 'https://twitter.com/intent/tweet?related=shelby&url=' + tweetUrl + '&text=' + encodeURIComponent(tweetMessage) + '';

    return url;
  },

  _buildShareUrl : function() {
    return this._baseURL + this._userId;
  },

  _shareToFacebook : function(e){
    e.preventDefault();
    if (typeof FB != "undefined"){
      FB.ui(
        {
          link        : this._baseURL + this._userId,
          method      : 'send'
        },
        function(response) {
          if (response && response.success) {
            // TODO:we should record that this happened.
          }
        }
      );
    }
  },

  _onFetchedFriends : function(friendRolls) {
    if (friendRolls.length && this._facebookConnected) {
      this.$el.find('.js-friends-spinner').remove();

      // we have some friends to invite, go ahead and render the list of them with invite buttons
      this.appendChildInto(new libs.shelbyGT.ListView({
        collection : new Backbone.Collection(friendRolls),
        // show the friends with the most video at the top
        comparator : function(roll) {
          return -roll.get('frame_count');
        },
        doStaticRender : true,
        listItemView : 'OnboardingInviteFriendItemView',
        listItemViewAdditionalParams : {
          onboarding : false
        },
        simulateAddTrue : false
      }), '.js-invite-friends-body');
    } else {
      this.$el.find('.js-invite-friends-body').html("<b>Your friends are already on Shelby!</b>");
    }
  }

});
