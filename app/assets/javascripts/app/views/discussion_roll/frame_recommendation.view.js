libs.shelbyGT.FrameRecommendationView = Support.CompositeView.extend({

  _firstFriend : null,

  options : {
    isPvi : false, // is this view inside of the PersistentVideoInfoView?
    numAvatarsDisplayed : 10 // the number of friend avatars to display
  },

  template: function(obj){
    return SHELBYJST['frame-recommendation'](obj);
  },

  render: function(){
    if (this._firstFriend) {
      this._firstFriend.unbind('change:nickname', this.render, this);
      this._firstFriend = null;
    }

    var friendsCollection = null;
    var dbeAction = this.model.get('action');
    var isEntertainmentGraph = dbeAction == libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.entertainmentGraphRecommendation;
    if (isEntertainmentGraph) {
      friendsCollection = this.model.convertFriendIdsToUserCollection();
      friendsCollection.reset(friendsCollection.first(this.options.numAvatarsDisplayed));
      this._firstFriend = friendsCollection.first();
      this._firstFriend.bind('change:nickname', this.render, this);
    }
    var numFriends = friendsCollection ? friendsCollection.length : 0;

    // UI settings, per use-case
    var settings = shelby.config.recommendations.displaySettings[dbeAction];

    this.$el.html(this.template({
      dashboardEntry : this.model,
      dbeAction :  dbeAction,
      firstFriend : this._firstFriend,
      numFriends : numFriends,
      isEntertainmentGraph : isEntertainmentGraph,
      isPvi : this.options.isPvi,
      settings: settings
    }));

    if (!this.options.isPvi && isEntertainmentGraph && numFriends) {
      // render the friends' avatars, now if they've already arrived, or via event handling
      // later if the ajax hasn't returned yet
      this.renderChild(new libs.shelbyGT.ListView({
        collection : friendsCollection,
        doStaticRender : true,
        el : this.$('.js-friend-avatars-list'),
        listItemView : 'ActorAvatarItemView',
        listItemViewAdditionalParams : {
          actorDescription : 'recommender'
        }
      }));
    }
  }

});
