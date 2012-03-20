DashboardModel = Backbone.RelationalModel.extend({
  relations : [{
    type : Backbone.HasMany,
    key : 'dashboard_entries',
    relatedModel : 'DashboardEntryModel',
    collectionType : 'DashboardEntriesCollection'
  }],

  parse : function(response) {
    return ({dashboard_entries: response.result || []});
  },

  //urlRoot : 'http://localhost:3001/dashboard.json'
  url : shelby.config.apiRoot+'/dashboard'
});
