libs.shelbyGT.UserCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.UserModel,

  // method:url - generates a url which can be used to load or reload data
  //  for models in the collection
  url: function(models) {
    return shelby.config.apiRoot + '/user' + ( models ? '?ids=' + _.pluck( models, 'id' ).join(',') : '' );
  }

});