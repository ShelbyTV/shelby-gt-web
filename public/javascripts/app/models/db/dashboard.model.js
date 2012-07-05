libs.shelbyGT.DashboardModel = libs.shelbyGT.ShelbyBaseModel.extend({

  relations : [{
    type : Backbone.HasMany,
    key : 'dashboard_entries',
    relatedModel : 'libs.shelbyGT.DashboardEntryModel',
    collectionType : 'libs.shelbyGT.DashboardEntriesCollection'
  }],

  parse : function(response) {
    // filtering out faux users so as a team we can interact with real users easily as they come in.
    if ($.getUrlParam("real_users") == 1){ response.result = this._filterOutFauxUsers(response); }
    
    return ({dashboard_entries: response.result || []});
  },

  //urlRoot : 'http://localhost:3001/dashboard.json'
  url : shelby.config.apiRoot+'/dashboard',
  
  _filterOutFauxUsers : function(response){
    return _.filter(response.result, function(e){ return e.frame.creator.faux != 1; });
  }
  
});
