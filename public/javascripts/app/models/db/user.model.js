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
    },{
      type : Backbone.HasOne,
      key : 'public_roll',
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
  },

  parse : function (response) {
    // extract the result property
    var result = libs.shelbyGT.ShelbyBaseModel.prototype.parse.call(this, response);
    // wrap the watch later roll id in a model
    // seems like Backbone Relational should do this for us for lazy loading, but it seems to choke because
    // this is a HasOne relation and there is no model already in the Relational Store with a matching id
    var watchLaterRoll = new libs.shelbyGT.RollModel({id:result.watch_later_roll});
    result.watch_later_roll = watchLaterRoll;
    return result;
  }

});
