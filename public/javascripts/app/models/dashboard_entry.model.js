// Dashboard Entry Model
// ----------

DashboardEntryModel = Backbone.RelationalModel.extend({
  relations : [{
    type : Backbone.HasOne,
    key : 'frame',
    relatedModel : 'FrameModel',
    createModels : true
  }]
});
