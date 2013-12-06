// class ClientSideFrameModel
// --------------------------
// Subclass of frame model that overrides common Frame operations
// to deal with the fact that this frame is not persisted on the
// backend
libs.shelbyGT.ClientSideFrameModel = libs.shelbyGT.FrameModel.extend({

  _clientSideFrameType : null,

  constructor : function(attributes, options) {
    if (options) {
      if (options.clientSideFrameType) {
        this._clientSideFrameType = options.clientSideFrameType;
      } else if (options.collection && options.collection.clientSideFrameType) {
        this._clientSideFrameType = options.collection.clientSideFrameType;
      }
    }
    libs.shelbyGT.FrameModel.apply(this, arguments);
  },

  /*
  --saveToWatchLater currently deprecated as its functionality is subsumed under the next method, like()--
  saveToWatchLater : function(onSuccess) {
    var _newFrame = new libs.shelbyGT.FrameModel();
    var _wl_roll = shelby.models.user.get('watch_later_roll');
    var _ajaxData = {url: this.get('video').get('source_url'), source: 'webapp'};
    var _message = this.likeMessage();
    if (_message) {
        _ajaxData.text = _message;
      }
    _newFrame.save(
      _ajaxData,
      {url: shelby.config.apiRoot + '/roll/'+_wl_roll.id+'/frames',
      success: function(newFrame){
        // we only want to update the set of queued videos if the ajax call succeeds,
        // that's the only way that the Queued state of a video will persist across navigation
        // around the app
        shelby.models.queuedVideos.get('queued_videos').add(newFrame.get('video'));
        if (onSuccess) onSuccess();
      }
    });

    shelby.track( 'add_to_queue', { frameId: this.id, userName: shelby.models.user.get('nickname') });
  },
  --saveToWatchLater currently deprecated as its functionality is subsumed under the next method, like()--
  */

  like : function(options) {
    // default options
    options = _.chain({}).extend(options).defaults({
      likeOrigin : 'Frame'
    }).value();

    // in the current state of things it doesn't make any sense for a logged out user to "like" a frame
    // that doesn't exist anywhere persistent
    if (!shelby.models.user.isAnonymous()) {
      // liking a client side frame for a logged in user means only adding it to their watch later roll,
      // so create a persistent frame on the backend to add to that roll
      var _newFrame = new libs.shelbyGT.FrameModel();
      // TODO: also find a way to increment the new frame's like count
      var _wl_roll = shelby.models.user.get('watch_later_roll');
      var _ajaxData = {url: this.get('video').get('source_url'), source: 'webapp'};
      _newFrame.save(
        _ajaxData,
        {url: shelby.config.apiRoot + '/roll/'+_wl_roll.id+'/frames',
        success: function(newFrame){
          // we only want to update the set of queued videos if the ajax call succeeds,
          // that's the only way that the Queued state of a video will persist across navigation
          // around the app
          shelby.models.queuedVideos.get('queued_videos').add(newFrame.get('video'));
        }
      });
    } else {
      // just for appearances sake (so that all instances of this video get their like button flipped to a red heart),
      // add the video to the local collection tracking which videos the user has liked, even though we didn't make
      // any actual updates on the backend
      shelby.models.queuedVideos.get('queued_videos').add(this.get('video'));
    }
    // different tracking for like action on client side frames
    shelby.trackEx({
      providers : ['ga', 'kmq'],
      gaCategory : options.likeOrigin,
      gaAction : 'liked',
      gaLabel : shelby.models.user.get('nickname')
    });

    // do things that should be done after a user likes a video
    Backbone.Events.trigger('userHook:like');
  },

  likeMessage : function() {
    if (this._clientSideFrameType == 'Search') {
      return "I like this video that I found with Shelby video search.";
    } else {
      return "I like this video that Shelby recommended to me.";
    }
  },

  reRoll : function(roll, text, onSuccess) {
    var frameToReroll = new libs.shelbyGT.FrameModel();
    var url = shelby.config.apiRoot + '/roll/' + roll.id + '/frames';
    frameToReroll.save({frame_id: this.id, text: text}, {url:url,success:onSuccess});
    libs.utils.rhombus.sadd('frames_rolled', this.id);
    shelby.track( 'add_to_roll', { frameId: this.id, rollId: roll.id, userName: shelby.models.user.get('nickname') });
  },

  watched : function(completeWatch, startTime, endTime, onSuccess) {
    if (this._clientSideFrameType != 'Search') {
      this.get('video').watched(completeWatch, startTime, endTime, onSuccess);
    }
  },

  // return a boolean specifying whether this frame can be shortlinked
  canBeShortlinked : function() {
    //TODO: we need to find a way to shortlink these because they we want people
    //  to be able to share recommendations
    return false;
  },

  // return a boolean specifying whether or not this frame has a comment to be displayed
  // on its video card
  hasComment : function() {
    var messages = this.get('conversation') && this.get('conversation').get('messages');
    return (messages && messages.length);
  },

  // return a description of what information should be used to present this frame's origin
  originInfoType : function() {
    return libs.shelbyGT.FrameModel.ORIGIN_INFO_TYPE.videoProvider;
  },

  // whether or not the frame can be reRolled, false means it can only be added via URL
  canReRoll : function() {
    return false;
  },

  // return a string used to describe what type of frame this is for event tracking
  // pass in a db entry if you want to include some information about the dbentry in the description
  getFrameDescription : function(parentDbe) {
    if (this._clientSideFrameType) {
      return ("Frame - " + this._clientSideFrameType);
    } else {
      return libs.shelbyGT.FrameModel.prototype.getFrameDescription.call(this, parentDbe);
    }
  }

});