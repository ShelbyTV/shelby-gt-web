libs.shelbyGT.DashboardEntryModel = Backbone.RelationalModel.extend({
  relations : [{
    type : Backbone.HasOne,
    key : 'frame',
    relatedModel : 'libs.shelbyGT.FrameModel',
    createModels : true
  }]
});
