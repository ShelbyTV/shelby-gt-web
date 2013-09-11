libs.shelbyGT.UserPreferencesFriendsView = libs.shelbyGT.UserPreferencesBaseView.extend({

  _baseURL : 'http://shelby.tv/signup/',

  events : {
    'click .js-facebook-post' : '_shareToFacebook',
    'click .js-user-tab'      : '_toggleFriendsLists'
  },

  className: 'content_lining preferences_page preferences_page--friends',

  options : _.extend({}, libs.shelbyGT.UserPreferencesBaseView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-friends'](obj);
  },

  render : function(){
    var self = this;
    console.log(this,this.model);

    this._userId = shelby.models.user.get('id');

    this.options.rollFollowings.fetch({
        data : {
          'include_faux' : 1
        },
        success : function(model, response) {
          var friends = {
                twitter  : [],
                tumblr   : [],
                facebook : []
              };
          _(model.get('rolls').models).each(function(roll){

            if (roll.get('creator_id') != shelby.models.user.id &&
                roll.id != shelby.models.user.get('watch_later_roll_id')/* &&
                (roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_roll || roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_public)*/){

              if(roll.has('creator_authentications')) {
                  var authentications = _(roll.get('creator_authentications'));

                if(authentications.where({'provider':'twitter'}).length > 0 ){
                  friends.twitter.push(roll);
                }

                if (authentications.where({'provider':'tumblr'}).length > 0 ){
                  friends.tumblr.push(roll);
                }

                if (authentications.where({'provider':'facebook'}).length > 0 ){
                  friends.facebook.push(roll);
                }
              }
            }
          });

          // notify the view of the friends we found
          self.model.trigger('onboarding:invite:fetchedFriends', friends);
        }
      });

    var data = {
      shareURL          : this._buildShareUrl(this._userId),
      tweetURL          : this._buildTweetUrl(this._userId),
      facebookConnected : this._facebookConnected,
      twitterConnected  : this._twitterConnected,
      tumblrConnected   : this._tumblrConnected,
      tab               : this.options.tab
		};

    this.$el.html(this.template(data));

  },

  initialize : function(){
    this._facebookConnected = _(shelby.models.user.get('authentications')).any(function(auth){ return auth.provider == 'facebook'; });
    this._twitterConnected  = _(shelby.models.user.get('authentications')).any(function(auth){ return auth.provider == 'twitter'; });
    this._tumblrConnected   = _(shelby.models.user.get('authentications')).any(function(auth){ return auth.provider == 'tumblr'; });
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

  _onFetchedFriends : function(friendsLists) {
      this.appendChildInto(new libs.shelbyGT.ListView({
        collection : new Backbone.Collection(friendsLists.tumblr),
        // show the friends with the most video at the top
        comparator : function(roll) {
          return -roll.get('frame_count');
        },
        doStaticRender  : true,
        listItemView    : 'OnboardingInviteFriendItemView',
        listItemViewAdditionalParams : {
          onboarding : false,
          network : 'tumblr'
        },
        simulateAddTrue : false
      }), '.js-invite-friends-body--tumblr');

      this.appendChildInto(new libs.shelbyGT.ListView({
        collection : new Backbone.Collection(friendsLists.facebook),
        // show the friends with the most video at the top
        comparator : function(roll) {
          return -roll.get('frame_count');
        },
        doStaticRender  : true,
        listItemView    : 'OnboardingInviteFriendItemView',
        listItemViewAdditionalParams : {
          onboarding : false,
          network: 'facebook'
        },
        simulateAddTrue : false
      }), '.js-invite-friends-body--facebook');

      this.appendChildInto(new libs.shelbyGT.ListView({
        collection : new Backbone.Collection(friendsLists.twitter),
        // show the friends with the most video at the top
        comparator : function(roll) {
          return -roll.get('frame_count');
        },
        doStaticRender  : true,
        listItemView    : 'OnboardingInviteFriendItemView',
        listItemViewAdditionalParams : {
          onboarding : false,
          network : 'twitter'
        },
        simulateAddTrue : false
      }), '.js-invite-friends-body--twitter');
  },
  _toggleFriendsLists : function(e){
    e.preventDefault();
    shelby.router.navigate(e.currentTarget.pathname, {trigger: false, replace: false});
    var tab = e.currentTarget.pathname.split('/preferences/friends/')[1];
    console.log(tab);
    $('.tabs').children().children().removeClass('tab--active');
    $(e.currentTarget).addClass('tab--active');
    this.$el.find('.js-invite-friends-body--' + tab ).removeClass('hidden').siblings().addClass('hidden');
  }

});
