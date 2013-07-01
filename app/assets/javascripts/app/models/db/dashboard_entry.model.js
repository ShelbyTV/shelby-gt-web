libs.shelbyGT.DashboardEntryModel = libs.shelbyGT.ShelbyBaseModel.extend({
  relations : [{
    type : Backbone.HasOne,
    key : 'frame',
    relatedModel : 'libs.shelbyGT.FrameModel',
    createModels : true
  },{
    type : Backbone.HasOne,
    key : 'src_frame',
    relatedModel : 'libs.shelbyGT.FrameModel',
    createModels : true
  }]
});

libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES = {
  videoGraphRecommendation : 31
};