DashboardModel = Backbone.RelationalModel.extend({
  relations : [{
    type : Backbone.HasMany,
    key : 'dashboard_entries',
    relatedModel : 'DashboardEntryModel',
    collectionType : 'DashboardEntriesCollection'
  }]
});
