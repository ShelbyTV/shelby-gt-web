libs.shelbyGT.RollModel = libs.shelbyGT.ShelbyBaseModel.extend({

  relations : [{
    type : Backbone.HasMany,
    key : 'frames',
    relatedModel : 'libs.shelbyGT.FrameModel',
    collectionType : 'libs.shelbyGT.FramesCollection'
  }],

  url : function() {
	  return shelby.config.apiRoot + '/roll/' + this.id + '/frames';
  }
});
