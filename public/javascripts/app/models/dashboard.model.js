DashboardModel = Backbone.RelationalModel.extend({

  urlRoot : 'http://localhost:3001/dashboard.json',

  relations : [{
    type : Backbone.HasMany,
    key : 'dashboard_entries',
    relatedModel : 'DashboardEntryModel',
    collectionType : 'DashboardEntriesCollection'
  }]

});
