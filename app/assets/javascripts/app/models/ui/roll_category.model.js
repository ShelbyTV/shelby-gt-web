libs.shelbyGT.RollCategoryModel = Backbone.RelationalModel.extend({

  defaults : {
    category : null
  },

  relations : [
    {
      type : Backbone.HasMany,
      key : 'rolls',
      relatedModel : 'libs.shelbyGT.RollModel',
      collectionType : 'libs.shelbyGT.RollsCollection'
    }
  ]

});
