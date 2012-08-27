libs.shelbyGT.RollCategoriesCollectionModel = libs.shelbyGT.ShelbyBaseModel.extend({

  relations : [
    {
      type : Backbone.HasMany,
      key : 'roll_categories',
      relatedModel : 'libs.shelbyGT.RollCategoryModel',
      collectionType : 'libs.shelbyGT.RollCategoriesCollection'
    }
  ],

  url : function() {
    return shelby.config.apiRoot + '/roll/explore';
  },

  parse : function(response) {
    return ({
      roll_categories : response.result || []
    });
  }

});
