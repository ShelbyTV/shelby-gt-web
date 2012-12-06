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
    return libs.shelbyGT.ShelbyBaseModel.prototype.sync.call(this, method, model, options);
  },

  url : function() {
    return shelby.config.apiRoot + '/frame/' + this.id;
  },
  
  shareUrl : function(){
    return shelby.config.apiRoot + '/frame/' + this.id + '/share';
  },

  saveToWatchLater : function(onSuccess) {
    var self = this;
    var frameToReroll = new libs.shelbyGT.FrameModel();
    var url = shelby.config.apiRoot + '/frame/' + this.id + '/add_to_watch_later';
    
    if (this.get('isSearchResultFrame')) {
      var _newFrame = new libs.shelbyGT.FrameModel();
      var _wl_roll = shelby.models.user.get('watch_later_roll');
      var _message = "added to shelby via a video search";
      _newFrame.save(
        {url: this.get('video').get('source_url'), text: _message, source: 'webapp'},
        {url: shelby.config.apiRoot + '/roll/'+_wl_roll.id+'/frames',
        success: function(newFrame){
          // we only want to update the set of queued videos if the ajax call succeeds,
          // that's the only way that the Queued state of a video will persist across navigation
          // around the app
          shelby.models.queuedVideos.get('queued_videos').add(newFrame.get('video'));
          if (onSuccess) onSuccess();
        }
      });
      
    }
    else {
      frameToReroll.save(null, {
        global : false, // we don't care if the ajax call fails
        url : url,
        success : function(frameModel, response){
          // we only want to update the set of queued videos if the ajax call succeeds,
          // that's the only way that the Queued state of a video will persist across navigation
          // around the app
          shelby.models.queuedVideos.get('queued_videos').add(self.get('video'));
          if (onSuccess) onSuccess();
        }
      });
    }
    shelby.track( 'add_to_queue', { frameId: this.id, userName: shelby.models.user.get('nickname') });
  },

  reRoll : function(roll, text, onSuccess) {
    var frameToReroll = new libs.shelbyGT.FrameModel();
    var url = shelby.config.apiRoot + '/roll/' + roll.id + '/frames';
    frameToReroll.save({frame_id: this.id, text: text}, {url:url,success:onSuccess});
    libs.utils.rhombus.sadd('frames_rolled', this.id);
    shelby.track( 'add_to_roll', { frameId: this.id, rollId: roll.id, userName: shelby.models.user.get('nickname') });
  },
  
  upvote : function(onSuccess) {
    var frameToUpvote = new libs.shelbyGT.FrameModel();
    var url = shelby.config.apiRoot + '/frame/' + this.id + '/upvote';
    frameToUpvote.save(null, {url:url, success:onSuccess});
    libs.utils.rhombus.sadd('frames_upvoted', this.id);
    shelby.track( 'heart_video', { id: this.id, userName: shelby.models.user.get('nickname') });
  },
  
  watched : function(startTime, endTime, onSuccess) {
    if (shelby.models.guide.get('displayState') == libs.shelbyGT.DisplayState.search) { return; }
    var frameWatched = new libs.shelbyGT.FrameModel();
    var url = shelby.config.apiRoot + '/frame/' + this.id + '/watched';
    if(startTime && endTime){
      url += '?startTime='+startTime+'&endTime='+endTime;
    }
    frameWatched.save(null, {url:url, success:onSuccess});
  },

  isOnRoll : function(roll) {
    var rollId = typeof(roll) === 'string' ? roll : roll.id;
    return this.has('roll') && this.get('roll').id == rollId;
  },

  isOnRollTypeGenius : function () {
    return this.has('roll') && this.get('roll').attributes.genius;
  },

  conversationUsesCreatorInfo : function(viewingUser) {
      //get the first message
      var firstMessage = this.get('conversation') && this.get('conversation').get('messages').first();
      //true if there is a first message and the user of the first message is the one who created the frame
      var haveCreatorMessage = firstMessage && firstMessage.get('user_id') == this.get('creator_id');
      //tue if there is a first message and the user is viewing their own role
      var haveWatchLaterMessage = firstMessage && (this.isOnRoll(viewingUser.get('watch_later_roll')));
      //true only if the first message of the "conversation uses creator info"
      return !haveCreatorMessage && !haveWatchLaterMessage;
  },

  getVideoThumbnailUrl : function() {
    var url = this.has('video') && this.get('video').has('thumbnail_url') && this.get('video').get('thumbnail_url');
    return url ? url : null;
  },
  
  getSubdomainPermalink : function(){
    var url;
    if (this.has('roll') && this.get('roll').has('subdomain')){
      url = this.get('roll').get('subdomain') + '.shelby.tv/' + this.id  ;
    }
    return url ? url : null;
  }

});
