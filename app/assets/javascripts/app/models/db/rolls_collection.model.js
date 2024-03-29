libs.shelbyGT.RollsCollectionModel = libs.shelbyGT.ShelbyBaseModel.extend({

  relations : [
    {
      type : Backbone.HasMany,
      key : 'rolls',
      relatedModel : 'libs.shelbyGT.RollModel',
      collectionType : 'libs.shelbyGT.RollsCollection'
    }
  ],

  url : function() {
    return shelby.config.apiRoot + '/user/' + shelby.models.user.id + '/rolls/following';
  },

  parse : function(response) {
    return ({
      initialized : true,
      rolls : response.result || []
    });
  },

  containsRoll : function(roll) {
    if (_.find(this.get('rolls').models, function(n){ return n.id == roll.id; })){
      return true;
    } else {
      return false;
    }
  },

  getRollModelById : function(rollId) {
    return this.get('rolls').get(rollId);
  },

  add : function(rollModel, options) {
    this.get('rolls').add(rollModel, options);
  },

  remove : function(rollModel) {
    this.get('rolls').remove(this.get('rolls').get(rollModel.id));
  }

});
