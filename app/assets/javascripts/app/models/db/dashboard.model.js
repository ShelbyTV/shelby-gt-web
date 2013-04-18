libs.shelbyGT.DashboardModel = libs.shelbyGT.ShelbyBaseModel.extend({

  relations : [{
    type : Backbone.HasMany,
    key : 'dashboard_entries',
    relatedModel : 'libs.shelbyGT.DashboardEntryModel',
    collectionType : 'libs.shelbyGT.DashboardEntriesCollection'
  }],

  parse : function(response) {
    return ({dashboard_entries: response.result || []});
  },

  //urlRoot : 'http://localhost:3001/dashboard.json'
  url : function() {
    var channel = this.get('channel');
    if (channel) {
      return shelby.config.apiRoot + '/user/' + shelby.config.channels[channel].id + '/dashboard';
    } else if (this.get('prioritizedDashboard')){
      return shelby.config.apiRoot+'/prioritized_dashboard';
    } else {
      return shelby.config.apiRoot+'/dashboard';
    }
  }

});
