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

    options || (options = {});

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
         if (this.at(j).getFirstFrame().get('video').id == video_id) {
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
      }
    }

    return this;
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
  }

});
