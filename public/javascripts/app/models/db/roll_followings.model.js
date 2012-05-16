libs.shelbyGT.RollFollowingsModel = libs.shelbyGT.ShelbyBaseModel.extend({

  relations : [{
    type : Backbone.HasMany,
    key : 'roll_followings',
    relatedModel : 'libs.shelbyGT.RollModel',
    collectionType : 'libs.shelbyGT.RollsCollection'
  }],

  parse : function(response) {
    return (response.result || []);
  },

  url : function(){
    return shelby.config.apiRoot + '/user/' + shelby.models.user.id + '/roll_followings';
  }
});
