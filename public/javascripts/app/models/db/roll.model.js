RollModel = Backbone.RelationalModel.extend({
  relations : [{
    type : Backbone.HasMany,
    key : 'frames',
    relatedModel : 'FrameModel',
    collectionType : 'FramesCollection'
  }],

  url : function() {
	return 'http://localhost:3001/roll/' + this.id + '.json';
  }
});
