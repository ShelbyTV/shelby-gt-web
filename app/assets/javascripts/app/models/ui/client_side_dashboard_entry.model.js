// class ClientSideDashboardEntryModel
// --------------------------
// Subclass of dashboard entry model that overrides common DashboardEntry operations
// and relations to deal with the fact that this dashboard entry is not persisted on the
// backend
libs.shelbyGT.ClientSideDashboardEntryModel = libs.shelbyGT.DashboardEntryModel.extend({

  relations : [{
    type : Backbone.HasOne,
    key : 'frame',
    relatedModel : 'libs.shelbyGT.ClientSideFrameModel',
    createModels : true
  },{
    type : Backbone.HasOne,
    key : 'src_frame',
    relatedModel : 'libs.shelbyGT.ClientSideFrameModel',
    createModels : true
  }],


});
