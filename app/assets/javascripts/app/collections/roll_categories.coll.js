libs.shelbyGT.RollCategoriesCollection = Backbone.Collection.extend({

  // Reference to this collection's model.
  model: libs.shelbyGT.RollCategoryModel,

  url : function() {
    return shelby.config.apiRoot + '/roll/explore';
  }

});
