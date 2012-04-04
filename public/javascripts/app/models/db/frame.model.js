libs.shelbyGT.FrameModel = libs.shelbyGT.ShelbyBaseModel.extend({
  relations : [
    {
      type : Backbone.HasOne,
      key : 'creator',
      relatedModel : 'libs.shelbyGT.UserModel'
    },{
      type : Backbone.HasOne,
      key : 'conversation',
      relatedModel : 'libs.shelbyGT.ConversationModel'
    },{
      type : Backbone.HasOne,
      key : 'video',
      relatedModel : 'libs.shelbyGT.VideoModel'
    },{
      type : Backbone.HasOne,
      key : 'roll',
      relatedModel : 'libs.shelbyGT.RollModel'
    }
  ],

  url : function() {
    return shelby.config.apiRoot + '/frame/' + this.id;
  },
	
  saveToWatchLater : function(onSuccess) {
    var frameToReroll = new libs.shelbyGT.FrameModel();
    var url = shelby.config.apiRoot + '/frame/' + this.id + '/add_to_watch_later';
    frameToReroll.save(null, {url:url,success:onSuccess});
  },

  reRoll : function(roll, onSuccess) {
    var frameToReroll = new libs.shelbyGT.FrameModel();
    var url = shelby.config.apiRoot + '/roll/' + roll.id + '/frames?frame_id=' + this.id;
    frameToReroll.save(null, {url:url,success:onSuccess});
  },

  upvote : function(onSuccess) {
		var frameToUpvote = new libs.shelbyGT.FrameModel();
    var url = shelby.config.apiRoot + '/frame/' + this.id + '/upvote';
    frameToUpvote.save(null, {url:url, success:onSuccess});
	}

});
