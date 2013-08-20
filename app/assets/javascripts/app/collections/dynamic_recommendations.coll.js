libs.shelbyGT.DynamicRecommendationsCollection = Backbone.Collection.extend({

  model : libs.shelbyGT.ClientSideDashboardEntryModel,

  parse : function(response) {
    return (response.result);
  },

});