libs.shelbyGT.RollCategoryModel = Backbone.RelationalModel.extend({

  defaults : {
    category_title : null
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
