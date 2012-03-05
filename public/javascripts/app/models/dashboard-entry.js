
// Dashboard Entry Model
// ----------

DashboardEntryModel = Backbone.RelationalModel.extend({

  relations : [{
    type : Backbone.HasOne,
    key : 'frame',
    relatedModel : 'FrameModel',
    createModels : true
  }],

  initialize : function(){
    console.log('frame:', this.get('frame'));
  }

});
