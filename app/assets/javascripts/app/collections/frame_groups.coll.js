libs.shelbyGT.FrameGroupsCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.FrameGroupModel,

  _collapseViewedFrameGroups : true,

  initialize : function(models, options) {
    // default options
    options = _.chain({}).extend(options).defaults({
      collapseViewedFrameGroups : true
    }).value();

    this._collapseViewedFrameGroups = options.collapseViewedFrameGroups;
    if (this._collapseViewedFrameGroups) {
      shelby.models.viewedVideos.bind('add:viewed_videos', this.viewedVideosUpdated, this);
    }
  },

  _cleanup : function(){
    if (this._collapseViewedFrameGroups) {
      shelby.models.viewedVideos.unbind('add:viewed_videos', this.viewedVideosUpdated, this);
    }
  },

  viewedVideosUpdated : function(videoModel, viewedVideosCollection, options){
    for (var i = 0, length = this.length; i < length; i++) {
      var model = this.at(i);
      if (model.get('frames').length){
        if (model.getFirstFrame().get('video').id == videoModel.id) {
          model.set({ collapsed : true });
        }
      }
    }
  },

  add: function(models, options) {

    options = options || {};

    models = _.isArray(models) ? models.slice() : [models];

    for (var i = 0, length = models.length; i < length; i++) {
      model = models[i];

      if (!model) {
         return false;
      }

      var video_id,
          frame,
          dashboard_entry;

      if (model instanceof libs.shelbyGT.DashboardEntryModel) {
        if (!model.get('frame') || !model.get('frame').get('video')){
          return false;
        }

        video_id = model.get('frame').get('video').get('id');
        frame = model.get('frame');
        dashboard_entry = model;

      } else if (model instanceof libs.shelbyGT.FrameModel) {
        if (!model.get('video')){
          return false;
        }

        video_id = model.get('video').get('id');
        frame = model;
        dashboard_entry = null;

      } else {
        continue;
      }

      var dupe = false;

      for (var j = 0; j < this.length && !dupe; j++) {
         // any two entries with the same video are dupes, UNLESS one of them
         // is a video recommendation and one is not - video recommendations
         // should still be shown separately even if there is another entry
         // with that same video
         var areSameVideo = this.at(j).getFirstFrame().get('video').id == video_id;
         var neitherAreVideoRecs = !dashboard_entry ||
                                   (dashboard_entry.get('action') != libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.videoGraphRecommendation &&
                                   this.at(j).get('primaryDashboardEntry').get('action') != libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.videoGraphRecommendation);
         var neitherAreMocks = !dashboard_entry || (!dashboard_entry.get('mockDBE') && !this.at(j).get('primaryDashboardEntry').get('mockDBE'));
         if (areSameVideo && neitherAreVideoRecs && neitherAreMocks) {
            this.at(j).add(frame, dashboard_entry, options);
            dupe = true;
         }
      }

      if (!dupe) {
        var frameGroup = new libs.shelbyGT.FrameGroupModel();
        frameGroup.add(frame, dashboard_entry, options);

        if (this._collapseViewedFrameGroups) {
           var viewed = shelby.models.viewedVideos.get('viewed_videos').find(function(entry){
             return entry.id == frame.get('video').id;
           });

           if (viewed) {
             frameGroup.set({ collapsed : true }, options);
           }
        }

        Backbone.Collection.prototype.add.call(this, frameGroup, options);

        if (dashboard_entry && !dashboard_entry.get('mockDBE') && dashboard_entry.get('action') !== libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.videoGraphRecommendation) {
          this._convertRecsToNewFrameGroups(frame, frameGroup, options);
        }
      }
    }

    return this;
  },

  getFrameById : function(frameId) {
    for (var i = 0; i < this.length; i++) {
      var frameGroupFrames = this.at(i).get('frames');
      for (var j = 0; j < frameGroupFrames.length; j++) {
        var checkFrame = frameGroupFrames.at(j);
        if (checkFrame.id == frameId) {
          return checkFrame;
        }
      }
    }

    return null;
  },

  getFrameGroupByFrameId : function(frameId) {
    for (var i = 0; i < this.length; i++) {
      var frameGroup = this.at(i);
      var frameGroupFrames = frameGroup.get('frames');
      for (var j = 0; j < frameGroupFrames.length; j++) {
        var checkFrame = frameGroupFrames.at(j);
        if (checkFrame.id == frameId) {
          return frameGroup;
        }
      }
    }

    return null;
  },

  getNextPlayableFrame : function(currentFrame, skip, returnFirstOnFail) {
    returnFirstOnFail = typeof returnFirstOnFail !== 'undefined' ? returnFirstOnFail : false;

    // look for a frame group that contains the currently playing frame
    var currentlyPlayingIndex = this._indexOfMatchingFrameGroup(currentFrame);
    if (currentlyPlayingIndex != -1) {
      var nextPlayableFrameGroup = this._findNextPlayableFrameGroup(currentlyPlayingIndex, skip);
      if (nextPlayableFrameGroup) {
        return nextPlayableFrameGroup.getFirstFrame();
      } else if(returnFirstOnFail) {
        return this.length ? this.at(0).getFirstFrame() : null;
      } else {
        return null;
      }
    } else if (returnFirstOnFail) {
      return this.length ? this.at(0).getFirstFrame() : null;
    } else {
      return null;
    }
  },

  isLastPlayableFrameGroup : function(currentFrame) {
    // look for a frame group that contains the currently playing frame
    var currentlyPlayingIndex = this._indexOfMatchingFrameGroup(currentFrame);
    if (currentlyPlayingIndex != -1) {
      return !this._findNextPlayableFrameGroup(currentlyPlayingIndex, 1);
    } else {
      return false;
    }
  },

  _indexOfMatchingFrameGroup : function(frame) {
    var _matchingFrameGroup = this.find(function(frameGroup){
      return frameGroup.get('frames').any(function(frameToCheck){
        return frameToCheck.id == frame.id;
      });
    });
    return this.indexOf(_matchingFrameGroup);
  },

  _findNextPlayableFrameGroup : function(currentFrameGroupIndex, skip) {
    var _index = currentFrameGroupIndex + skip;

    // loop to skip collapsed frames (looping should only happen in dashboard view)
    while (true) {

      if (_index < 0) {
        return null;
      } else if (_index >= this.length) {
        return null;
      }

      var _nextPotentialFrameGroup = this.at(_index);

      if (_nextPotentialFrameGroup.get('collapsed')) {
        _index = _index + skip; // keep looking for a non-collapsed frame group to play
      } else {
        break; // otherwise we have a good non-collapsed frame group to play
      }
    }

    return this.at(_index);
  },

    // TODO:
    // if frameGroup.primary_dasboard_entry
    // go search for that,
    // otherwise search for frame
    // FOR purpose of finding index below...

  _convertRecsToNewFrameGroups : function(frame, frameGroup, options){
    // don't get and show recs if we are displaying anything but dasboard or community
    if (shelby.models.guide.get('displayState') !== libs.shelbyGT.DisplayState.dashboard) { //&& shelby.models.guide.get('displayState') !== libs.shelbyGT.DisplayState.channel) {
      return;
    }

    var self = this;
    options = options || {};
    if (frame.has('video') && frame.get('video').has('recs') && frame.get('video').get('recs').length > 0) {
      var recommendations = frame.get('video').get('recs');
      // don't do anything if the recs attribute is already a collection
      if ($.isArray(recommendations)) {
        var _showN = Math.random() <= 0.5 ? 1 : 2;
        var slicedRecs = recommendations.slice(0, _showN);
        var recommendationsModels = _(slicedRecs).map(function(rec){
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
            var frameBsonId =  new ObjectId();
            frameModel = new libs.shelbyGT.FrameModel({
              id : frameBsonId.toString(),
              video : videoModel,
              conversation : {
                messages : [
                  {
                    text : videoModel.get('description')
                  }
                ]
              },
              mockFrame : true
            });

            // create dashboard entry with reference to frame (video)
            var dbeBsonId =  new ObjectId(); // is this even necessary???
            var newDBE = new libs.shelbyGT.DashboardEntryModel({
              id: dbeBsonId.toString(),
              action: libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.videoGraphRecommendation,
              user_id: shelby.models.user.id,
              frame: frameModel,
              src_frame: frame,
              mockDBE: true
            });
            // end dbe creation //

          var newFrameGroup = new libs.shelbyGT.FrameGroupModel();
          newFrameGroup.add(frameModel, newDBE, options);

          // if a user views a "real" shelby frame it will be in their viewed videos, so show it as collapsed
          // NOTE: currently a view of a recommended video is not recorded as the video doesnt really exist as a frame
          if (self._collapseViewedFrameGroups) {
            var viewed = shelby.models.viewedVideos.get('viewed_videos').find(function(entry){
              return entry.id == frameModel.get('video').id;
            });
           if (viewed) {
             newFrameGroup.set({ collapsed : true });
           }
          }

          var _currentCollection, _entity;
          // insert this new frameGroup at the appropriate place in the collection
          options.at = self._indexToInsertRecommendation(frame, self._associatedDisplayCollection) + 1;
          //console.log("at: ", options.at, newDBE);
          //console.log("collections:", self._associatedMasterCollection, self._associatedDisplayCollection);
          self._associatedDisplayCollection.add(newDBE, options);
          self._associatedMasterCollection.add(newDBE, options);
          }
        });
      }
    }
  },

  _indexToInsertRecommendation : function(entity, collection) {
    // entity can be a dbe or a frame ???
    shelby.testCollection = collection;
    shelby.testEntity = entity;
    if (collection.models[0].has('frame')){
      console.log("======= DBE =======", collection.length);
      var _matchingEntity = collection.find(function(c){
        if (c.get('frame').id == entity.id){
         return c;
        }
      });
      //console.log("_matchingEntity:", _matchingEntity);
    }
    else {
      console.log("======= NOT DBE =======", collection.length);
      var _matchingEntity = collection.find(function(c){
        return _.contains(c.get('frames').models, entity);
      });
      //console.log("_matchingEntity", _matchingEntity);
    }
    console.log("match at:", collection.indexOf(_matchingEntity));
    return collection.indexOf(_matchingEntity);
  }

});
