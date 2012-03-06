RollModel = Backbone.RelationalModel.extend({
  relations : [{
    type : Backbone.HasMany,
    key : 'frames',
    relatedModel : 'FrameModel'
  }]
});
