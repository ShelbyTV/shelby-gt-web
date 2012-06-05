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

  sync : function(method, model, options) {
    if (!options.url) {
      var url = shelby.config.apiRoot;
      switch (method) {
        case 'create' :
          url += '/frame?include_children=true';
          break;
        case 'update' :
        case 'delete' :
          url += '/frame/' + this.id;
          break;
        case 'read' :
          url += '/frame/' + this.id /*+ '/frames'*/;
          break;
      }
      options.url = url;
    }
    if (method==='create' && options.url.indexOf('/watched')===-1){
      options.url+='&include_children=true';
    }
    return libs.shelbyGT.ShelbyBaseModel.prototype.sync.call(this, method, model, options);
  },

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
  },
  
  watched : function(startTime, endTime, onSuccess) {
    var frameWatched = new libs.shelbyGT.FrameModel();
    var url = shelby.config.apiRoot + '/frame/' + this.id + '/watched?startTime='+startTime+'&endTime='+endTime;
    frameWatched.save(null, {url:url, success:onSuccess});
  },

  isOnRoll : function(rollModel) {
    return this.has('roll') && this.get('roll').id == rollModel.id;
  },

  isOnRollTypeGenius : function () {
    return this.has('roll') && this.get('roll').attributes.genius;
  },

  conversationUsesCreatorInfo : function(viewingUser) {
      //get the first message
      var firstMessage = this.get('conversation').get('messages').first();
      //true if there is a first message and the user of the first message is the one who created the frame
      var haveCreatorMessage = firstMessage && firstMessage.get('user_id') == this.get('creator_id');
      //tue if there is a first message and the user is viewing their own role
      var haveWatchLaterMessage = firstMessage && (this.isOnRoll(viewingUser.get('watch_later_roll')));
      //true only if the first message of the "conversation uses creator info"
      return !haveCreatorMessage && !haveWatchLaterMessage;
  }

});
