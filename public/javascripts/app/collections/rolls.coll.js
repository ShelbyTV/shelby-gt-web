libs.shelbyGT.RollsCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.RollModel,

  parse : function(response) {
    return (response.result || []);
  }

});
