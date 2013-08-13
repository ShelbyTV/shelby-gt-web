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
    },{
      type : Backbone.HasOne,
      key : 'originator',
      relatedModel : 'libs.shelbyGT.UserModel'
    }
  ],

  // another workaround 'inspired' by Mark's FrameGroup architecture:
  // ----------------------------------------------------------------
  // _primaryDashboardEntry - set with primary dashboard entry of the frame's
  // frame group, if it has one; don't mix it with the actual model attributes so we don't
  // accidentally consider it actual model data
  // would be much harder to get to this info when we need it if we didn't do this
  _primaryDashboardEntry : null,

  initialize : function() {
    this.set('upvoters', this.convertUpvoterIdsToUserCollection());
  },

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

  /*
  --saveToWatchLater currently deprecated as its functionality is subsumed under the next method, like()--
  saveToWatchLater : function(onSuccess) {
    var self = this;
    var frameToReroll = new libs.shelbyGT.FrameModel();
    var url = shelby.config.apiRoot + '/frame/' + this.id + '/add_to_watch_later';

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

    shelby.track( 'add_to_queue', { frameId: this.id, userName: shelby.models.user.get('nickname') });
  },
  --saveToWatchLater currently deprecated as its functionality is subsumed under the next method, like()--
  */

  like : function(options) {
    // default options
    options = _.chain({}).extend(options).defaults({
      likeOrigin : 'Frame'
    }).value();

    this.save(null, {
      global : false, // we don't care if the ajax call fails
      url : shelby.config.apiRoot + '/frame/' + this.id + '/like',
      success : function(frameModel, response){
        // we only want to update the set of queued videos if the ajax call succeeds,
        // that's the only way that the Queued state of a video will persist across navigation
        // around the app
        shelby.models.queuedVideos.get('queued_videos').add(frameModel.get('video'));
      }
    });
    shelby.trackEx({
      providers : ['ga', 'kmq'],
      gaCategory : options.likeOrigin,
      gaAction : 'liked',
      gaLabel : shelby.models.user.get('nickname'),
      kmqProperties : {
        frame : this.id
      }
    });

    // do things that should be done after a user likes a video
    Backbone.Events.trigger('userHook:like');
  },

  reRoll : function(roll, text, onSuccess) {
    var frameToReroll = new libs.shelbyGT.FrameModel();
    var url = shelby.config.apiRoot + '/roll/' + roll.id + '/frames';
    frameToReroll.save({frame_id: this.id, text: text}, {url:url,success:onSuccess});
    libs.utils.rhombus.sadd('frames_rolled', this.id);
    shelby.track( 'add_to_roll', { frameId: this.id, rollId: roll.id, userName: shelby.models.user.get('nickname') });
  },

  watched : function(completeWatch, startTime, endTime, onSuccess) {
    var frameWatched = new libs.shelbyGT.FrameModel();
    var url = shelby.config.apiRoot + '/frame/' + this.id + '/watched';
    if(completeWatch){
      url += "?complete=1";
    } else if(typeof startTime != "undefined" && typeof endTime != "undefined"){
      url += '?start_time='+startTime+'&end_time='+endTime;
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

  convertUpvoterIdsToUserCollection : function(){
    // change the upvoters from an array of id strings to a collection of user models with those ids
    // CAN'T GET RELATIONAL TO DO THIS THE WAY I WANT SO DOING IT MYSELF

    var upvotersCollection;

    if (this.has('upvoters')) {
      var upvoters = this.get('upvoters');
      // don't do anything if the upvoters attribute is already a collection
      if ($.isArray(upvoters)) {
        var upvotersModels = _(upvoters).map(function(upvoterId){
          // if we already have a model in the global store for this user, use it
          var userModel = Backbone.Relational.store.find(libs.shelbyGT.UserModel, upvoterId);
          if (!userModel) {
            // otherwise, create a new, empty user model with the proper id
            userModel = new libs.shelbyGT.UserModel({id: upvoterId});
          }
          if (!userModel.has('has_shelby_avatar') || !userModel.has('personal_roll_subdomain')) {
            // if the user model doesn't contain the info we need to render the liker info,
            // make a request to the server to load/refresh it
            userModel.fetch();
          }
          return userModel;
        });
        upvotersCollection = new Backbone.Collection(upvotersModels);
      } else {
        upvotersCollection = upvoters;
      }
    } else {
      // if there was no upvoters attribute, just add one with an empty collection
      upvotersCollection = new Backbone.Collection();
    }

    return upvotersCollection;
  },

  // return a boolean specifying whether this frame can be shortlinked
  canBeShortlinked : function() {
    return true;
  },

  // return a boolean specifying whether or not this frame has a comment to be displayed
  // on its video card
  hasComment : function() {
    var messages = this.get('conversation') && this.get('conversation').get('messages');
    var creator = this.get('creator');
    return (messages && messages.length && creator && creator.id == messages.at(0).get('user_id'));
  },

  // return a boolean specifying whether or not this frame is eligible to have recommendations
  // displayed after it
  doShowRecommendationsAfter : function() {
    return true;
  },

  // return a description of what information should be used to present this frame's origin
  originInfoType : function() {
    return libs.shelbyGT.FrameModel.ORIGIN_INFO_TYPE.creator;
  },

  // whether or not the frame can be reRolled, false means it can only be added via URL
  canReRoll : function() {
    return true;
  }

});

libs.shelbyGT.FrameModel.ORIGIN_INFO_TYPE = {
  creator : 'creator',
  videoProvider : 'videoProvider'
};