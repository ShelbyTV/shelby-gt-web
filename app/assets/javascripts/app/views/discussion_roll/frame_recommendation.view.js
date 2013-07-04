libs.shelbyGT.FrameRecommendationView = Support.CompositeView.extend({

  _firstFriend : null,

  template: function(obj){
    return SHELBYJST['frame-recommendation'](obj);
  },

  render: function(){
    if (this._firstFriend) {
      this._firstFriend.unbind('change:nickname', this.render, this);
      this._firstFriend = null;
    }

    var friendsCollection = null;
    var isEntertainmentGraph = this.model.get('action') == libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.entertainmentGraphRecommendation;
    if (isEntertainmentGraph) {
      friendsCollection = this.model.convertFriendIdsToUserCollection();
      this._firstFriend = friendsCollection.first();
      this._firstFriend.bind('change:nickname', this.render, this);
    }
    var numFriends = friendsCollection ? friendsCollection.length : 0;
    this.$el.html(this.template({
      dashboardEntry: this.model,
      firstFriend : this._firstFriend,
      numFriends : numFriends,
      isEntertainmentGraph : isEntertainmentGraph
    }));

    if (isEntertainmentGraph && numFriends) {
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