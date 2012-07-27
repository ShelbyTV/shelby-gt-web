libs.shelbyGT.DashboardEntryModel = libs.shelbyGT.ShelbyBaseModel.extend({
  relations : [{
    type : Backbone.HasOne,
    key : 'frame',
    relatedModel : 'libs.shelbyGT.FrameModel',
    createModels : true
  }]
});
