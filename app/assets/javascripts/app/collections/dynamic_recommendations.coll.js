libs.shelbyGT.DynamicRecommendationsCollection = Backbone.Collection.extend({

  model : function(attrs, options) {
    if (
        attrs.action == libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.videoGraphRecommendation ||
        attrs.action == libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.entertainmentGraphRecommendation ||
        attrs.action == libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.mortarRecommendation
       ) {
      return new libs.shelbyGT.ClientSideDashboardEntryModel(attrs, options);
    } else {
      return new libs.shelbyGT.ClientSideDashboardEntryWithRealFrameModel(attrs, options);
    }
  },

  url : function() {
    return (shelby.config.apiRoot + '/user/' + shelby.models.user.id + '/recommendations');
  },

  parse : function(response) {
    return (response.result);
  },

});