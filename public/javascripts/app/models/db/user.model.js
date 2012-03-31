libs.shelbyGT.UserModel = libs.shelbyGT.ShelbyBaseModel.extend({

  relations : [
    {
      type : Backbone.HasMany,
      key : 'roll_followings',
      relatedModel : 'libs.shelbyGT.RollModel',
      collectionType : 'libs.shelbyGT.RollsCollection'
    },{
      type : Backbone.HasOne,
      key : 'watch_later_roll',
      relatedModel : 'libs.shelbyGT.RollModel'
    }
  ],
  
  url : function() {
    return shelby.config.apiRoot + '/user/' + (this.isNew() ? '' : this.id);
  },

  getFirstName : function(){
    return this.get('name').split(' ')[0];
  },

  getNextRoll : function(roll){
    var roll_followings = this.get('roll_followings');
    var index = (roll_followings.indexOf(roll) + 1) % roll_followings.length;
    return roll_followings.at(index);
  }

});
