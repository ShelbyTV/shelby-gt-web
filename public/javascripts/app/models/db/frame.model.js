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
    console.log(frameToReroll, url);
    frameToReroll.save(null, {url:url,success:onSuccess});
  },

  upvote : function(onSuccess) {
    var frameToUpvote = new libs.shelbyGT.FrameModel();
    var url = shelby.config.apiRoot + '/frame/' + this.id + '/upvote';
    frameToUpvote.save(null, {url:url, success:onSuccess});
  },
  
  watched : function(startTime, endTime, onSuccess) {
    var frameWatched = new libs.shelbyGT.FrameModel();
    var url = shelby.config.apiRoot + '/frame/' + this.id + '/watched?startTime='+startTime+'&endTime='+endTime;
    frameWatched.save(null, {url:url, success:onSuccess});
  },

  isOnRoll : function(rollModel) {
    return this.has('roll') && this.get('roll').id == rollModel.id;
  },

  conversationUsesCreatorInfo : function(viewingUser) {
      var firstMessage = this.get('conversation').get('messages').first();
      var haveCreatorMessage = firstMessage && firstMessage.get('user_id') == this.get('creator_id');
      var haveWatchLaterMessage = firstMessage && (this.isOnRoll(viewingUser.get('watch_later_roll')));
      return !haveCreatorMessage && !haveWatchLaterMessage;
  }

});
