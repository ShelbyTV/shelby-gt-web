libs.shelbyGT.RollsCollectionModel = libs.shelbyGT.ShelbyBaseModel.extend({

  relations : [
    {
      type : Backbone.HasMany,
      key : 'rolls',
      relatedModel : 'libs.shelbyGT.RollModel',
      collectionType : 'libs.shelbyGT.RollsCollection'
    }
  ],

  parse : function(response) {
    return ({
      rolls : response.result || []
    });
  }

});
