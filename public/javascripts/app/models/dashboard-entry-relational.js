
// Dashboard Entry Model
// ----------

DashboardEntryModelRelational = Backbone.RelationalModel.extend({

  relations : [{
    type : Backbone.HasOne,
    key : 'frame',
    relatedModel : 'FrameModelRelational',
    reverseRelation : {
      key : 'dashboardEntry',
      type : Backbone.HasOne
    },
    createModels : true
  }]

});
