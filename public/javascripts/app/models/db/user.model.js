libs.shelbyGT.UserModel = libs.shelbyGT.ShelbyBaseModel.extend({

  relations : [{
    type : Backbone.HasMany,
    key : 'roll_followings',
    relatedModel : 'libs.shelbyGT.RollModel',
    collectionType : 'libs.shelbyGT.RollsCollection'
  }],
  
  url : function() {
    return shelby.config.apiRoot + '/user/' + (this.isNew() ? '' : this.id);
  },

  getFirstName : function(){
    return this.get('name').split(' ')[0];
  },

  getWatchLaterRoll : function() {
    var watchLaterRoll = this.get('roll_followings').find(function(roll){
      return roll.get('title') == 'Watch Later';
    });
    return watchLaterRoll;
  }

});
