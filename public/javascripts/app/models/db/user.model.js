libs.shelbyGT.UserModel = libs.shelbyGT.ShelbyBaseModel.extend({

  relations : [
    {
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

  parse : function (response) {
    // extract the result property
    var result = libs.shelbyGT.ShelbyBaseModel.prototype.parse.call(this, response);
    //remove the id property from app_progress - THE API SHOULD DO THIS FOR US
    if (result.app_progress && result.app_progress.id){
      delete result.app_progress.id;
    }
    // wrap the watch later and public roll ids in models
    // seems like Backbone Relational should do this for us for lazy loading, but it seems to choke because
    // this is a HasOne relation and there is no model already in the Relational Store with a matching id
    var watchLaterRoll = new libs.shelbyGT.RollModel({id:result.watch_later_roll_id});
    result.watch_later_roll = watchLaterRoll;
    var personalRoll = new libs.shelbyGT.RollModel({id:result.personal_roll_id});
    result.personal_roll = personalRoll;
    return result;
  }

});
