libs.shelbyGT.DashboardEntryModel = libs.shelbyGT.ShelbyBaseModel.extend({
  relations : [{
    type : Backbone.HasOne,
    key : 'frame',
    relatedModel : 'libs.shelbyGT.FrameModel',
    createModels : true
  },{
    type : Backbone.HasOne,
    key : 'src_frame',
    relatedModel : 'libs.shelbyGT.FrameModel',
    createModels : true
  },{
    type : Backbone.HasOne,
    key : 'src_video',
    relatedModel : 'libs.shelbyGT.VideoModel',
    createModels : true
  }],

  isRecommendationEntry : function(){
    var action = this.get('action');
    return (action == libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.videoGraphRecommendation ||
            action == libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.entertainmentGraphRecommendation ||
            action == libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.mortarRecommendation);
  },

  allFriendIds : function(){
    return _((this.get('friend_sharers') || []).concat(this.get('friend_viewers')).concat(this.get('friend_likers'))
               .concat(this.get('friend_rollers')).concat(this.get('complete_viewers'))).compact();
  },

  convertFriendIdsToUserCollection : function(){
    // change the friends from an array of id strings to a collection of user models with those ids
    // CAN'T GET RELATIONAL TO DO THIS THE WAY I WANT SO DOING IT MYSELF

    var friendIds = this.allFriendIds();
    var friendModels = _(friendIds).map(function(friendId){
      // if we already have a model in the global store for this user, use it
      var userModel = Backbone.Relational.store.find(libs.shelbyGT.UserModel, friendId);
      if (!userModel) {
        // otherwise, create a new, empty user model with the proper id
        userModel = new libs.shelbyGT.UserModel({id: friendId});
      }
      if (!userModel.has('nickname')) {
        // if the user model doesn't contain the info we need to render the friend info,
        // make a request to the server to load/refresh it
        userModel.fetch();
      }
      return userModel;
    });

    return (new Backbone.Collection(friendModels));
  }

});

libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES = {
  videoGraphRecommendation : 31,
  entertainmentGraphRecommendation : 32,
  mortarRecommendation : 33
};