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
  }

});
