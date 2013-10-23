// class ClientSideDashboardEntryModel
// --------------------------
// Subclass of dashboard entry model that overrides common DashboardEntry and Frame operations
// and relations to deal with the fact that this dashboard entry and its frame are not persisted on the
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
    relatedModel : 'libs.shelbyGT.FrameModel',
    createModels : true
  },{
    type : Backbone.HasOne,
    key : 'src_video',
    relatedModel : 'libs.shelbyGT.VideoModel',
    createModels : true
  }],


});
