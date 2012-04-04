libs.shelbyGT.RollModel = libs.shelbyGT.ShelbyBaseModel.extend({

  relations : [{
    type : Backbone.HasMany,
    key : 'frames',
    relatedModel : 'libs.shelbyGT.FrameModel',
    collectionType : 'libs.shelbyGT.FramesCollection'
  }],

  url : function() {
    return shelby.config.apiRoot + '/roll/' + this.id + '/frames';
  },

  joinRoll : function(onSuccess) {
	  var rollToJoin = new libs.shelbyGT.RollModel();
    var url = shelby.config.apiRoot + '/roll/' + this.id + '/join';
    rollToJoin.save(null, {url:url, success:onSuccess});	  
  },

  leaveRoll : function(onSuccess) {
	  var rollToLeave = new libs.shelbyGT.RollModel();
    var url = shelby.config.apiRoot + '/roll/' + this.id + '/leave';
    rollToLeave.save(null, {url:url, success:onSuccess});
  }

});
