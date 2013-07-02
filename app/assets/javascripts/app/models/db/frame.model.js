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
    //this.set('recommendations', this.convertRecIdsToVideoCollection());
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
  --saveToWatchLater currently deprecated as its functionality is subsumed under the next method, like()--
  */

  like : function(options) {
    // default options
    options = _.chain({}).extend(options).defaults({
      likeOrigin : 'Frame'
    }).value();

    if (this.get('isSearchResultFrame')) {
      // in the current state of things it doesn't make any sense for a logged out user to "like" a search result
      if (!shelby.models.user.isAnonymous()) {
        // liking a search frame for a logged in user means only adding it to their watch later roll
        // TODO: also find a way to increment its like count
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
          }
        });
      } else {
        // just for appearances sake (so that all instances of this video get their like button flipped to a red heart),
        // add the video to the local collection tracking which videos the user has liked, even though we didn't make
        // any actual updates on the backend
        shelby.models.queuedVideos.get('queued_videos').add(this.get('video'));
      }
      // different tracking for like action on search frames
      shelby.track( 'liked on search', { frameId: this.id, userName: shelby.models.user.get('nickname') });
    } else {
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
    }

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

  upvote : function(onSuccess) {
    var frameToUpvote = new libs.shelbyGT.FrameModel();
    var url = shelby.config.apiRoot + '/frame/' + this.id + '/upvote';
    frameToUpvote.save(null, {url:url, success:onSuccess});
    libs.utils.rhombus.sadd('frames_upvoted', this.id);
    shelby.track( 'heart_video', { id: this.id, userName: shelby.models.user.get('nickname') });
  },

  watched : function(completeWatch, startTime, endTime, onSuccess) {
    if (shelby.models.guide.get('displayState') == libs.shelbyGT.DisplayState.search) { return; }
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

  convertRecIdsToVideoCollection : function(){
    // change the recs from an array of id strings to a collection of video models with those ids
    // CAN'T GET RELATIONAL TO DO THIS THE WAY I WANT SO DOING IT MYSELF
    var recommendationsCollection;

    if (this.has('video') && this.get('video').has('recs') && this.get('video').get('recs').length > 0) {
      console.log("FRAME HAS RECS");
      var recommendations = this.get('video').get('recs');
      // don't do anything if the recs attribute is already a collection
      if ($.isArray(recommendations)) {

        // for now limiting whats being fetched and created
        recsSelection = recommendations;

        var recommendationsModels = _(recsSelection).map(function(rec){
          // if we already have a model in the global store for this video, use it
          var videoModel = Backbone.Relational.store.find(libs.shelbyGT.VideoModel, rec.recommended_video_id);
          if (!videoModel) {
            // otherwise, create a new, empty video model with the proper id
            videoModel = new libs.shelbyGT.VideoModel({id: rec.recommended_video_id});
          }
          videoModel.fetch();
          // create frame
          var frameModel = Backbone.Relational.store.find(libs.shelbyGT.FrameModel, rec.recommended_video_id);
          if (!frameModel) {
            // create a fake frame to play
            frameModel = new libs.shelbyGT.FrameModel({
              id : videoModel.id,
              video : videoModel,
              conversation : {
                messages : [
                  {
                    text : videoModel.get('description')
                  }
                ]
              },
              isSearchResultFrame : true
            });

            // create dashboard entry with reference to frame (video)
            //var bsonId =  new ObjectId();
            var newDBE = new libs.shelbyGT.DashboardEntryModel({
              //id: bsonId.toString(),
              action: libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.videoGraphRecommendation,
              user_id: shelby.models.user.id,
              frame: frameModel,
              src_frame: this
            });

            //frameModel.set('_primaryDashboardEntry', newDBE);
            //console.log("newDBE:", newDBE);
            //shelby.models.playlistManager.get('playlistFrameGroupCollection').models.push(newDBE);
            //console.log(shelby.models.dashboard.get('dashboard_entries').models.length);
            // end dbe creation //
          }

          return frameModel;
          //return videoModel;
        });
        recommendationsCollection = new Backbone.Collection(recommendationsModels);
      } else {
        recommendationsCollection = recsSelection;
      }
    } else {
      // if there was no upvoters attribute, just add one with an empty collection
      recommendationsCollection = new Backbone.Collection();
    }

    return recommendationsCollection;
  }

});
