libs.shelbyGT.DynamicRecommendationsCollection = Backbone.Collection.extend({

  model : libs.shelbyGT.ClientSideDashboardEntryModel,

  url : function() {
    return (shelby.config.apiRoot + '/user/' + shelby.models.user.id + '/recommendations?scan_limit=' +
      shelby.config.recommendations.videoGraph.dashboardScanLimit + '&min_score=' + shelby.config.recommendations.videoGraph.minScore);
  },

  parse : function(response) {
    return (response.result);
  },

});