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
      key : 'personal_roll',
      relatedModel : 'libs.shelbyGT.RollModel'
    },{
      type : Backbone.HasOne,
      key : 'app_progress',
      relatedModel : 'libs.shelbyGT.AppProgressModel'
    }
  ],
  
  url : function() {
    return shelby.config.apiRoot + '/user/' + (this.isNew() ? '' : this.id);
  },

  getFirstName : function(){
    return this.get('name').split(' ')[0];
  },

  getPreviousRoll : function(roll){
    var roll_followings = this.get('roll_followings');
    var index = (roll_followings.indexOf(roll) - 1);
    if (index < 0) {
      index = roll_followings.length - 1;
    }
    return roll_followings.at(index);
  },

  getNextRoll : function(roll){
    var roll_followings = this.get('roll_followings');
    var index = (roll_followings.indexOf(roll) + 1) % roll_followings.length;
    return roll_followings.at(index);
  },

  parse : function (response) {
    // extract the result property
    var result = libs.shelbyGT.ShelbyBaseModel.prototype.parse.call(this, response);
    //remove the id property from app_progress - THE API SHOULD DO THIS FOR US
    if (result.app_progress && result.app_progress.id){
      delete result.app_progress.id;
    }
    //remove the watch later roll from the roll follwings - THE API SHOULD DO THIS FOR US
    if (result.roll_followings) {
      var roll_follwings_filtered = _(result.roll_followings).reject(function(roll){
        return roll.id == result.watch_later_roll;
      });
      result.roll_followings = roll_follwings_filtered;
    }
    // wrap the watch later and public roll ids in models
    // seems like Backbone Relational should do this for us for lazy loading, but it seems to choke because
    // this is a HasOne relation and there is no model already in the Relational Store with a matching id
    var watchLaterRoll = new libs.shelbyGT.RollModel({id:result.watch_later_roll_id});
    result.watch_later_roll = watchLaterRoll;
    var personalRoll = new libs.shelbyGT.RollModel({id:result.personal_roll_id});
    result.personal_roll = personalRoll;
    return result;
  },

  followsRoll : function(roll) {
    if (_.find(shelby.models.user.get('roll_followings').models, function(n){ return n.id == roll.id; })){
      return true;
    } else {
      return false;
    }
  },
	
	addUserToRoll: function(roll_id, onSuccess){
		var rollToJoin = new libs.shelbyGT.RollModel();
    var url = shelby.config.apiRoot + '/roll/' + roll_id + '/join';
    rollToJoin.save(null, {url:url, success:onSuccess});
	}

});
