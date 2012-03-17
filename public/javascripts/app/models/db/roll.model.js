RollModel = Backbone.RelationalModel.extend({

  relations : [{
    type : Backbone.HasMany,
    key : 'frames',
    relatedModel : 'FrameModel',
    collectionType : 'FramesCollection'
  }],

  url : function() {
	  return window.shelby.config.apiRoot + '/roll/' + this.id + '.json';
  }
});
