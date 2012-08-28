libs.shelbyGT.FrameGroupsCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.FrameGroupModel,

  initialize : function(models, options) {
    models || (models = {});
    options || (options = {});

    shelby.models.viewedVideos.get('viewed_videos').bind('change', this.viewedVideosUpdated, this);
    shelby.models.viewedVideos.get('viewed_videos').bind('reset', this.viewedVideosUpdated, this);
  },

  _cleanup : function(){
    shelby.models.viewedVideos.get('viewed_videos').unbind('change', this.viewedVideosUpdated, this);
    shelby.models.viewedVideos.get('viewed_videos').unbind('reset', this.viewedVideosUpdated, this);
  },

  viewedVideosUpdated : function(){

    var sortedViewedVideosArray = shelby.models.viewedVideos.get('viewed_videos').pluck('id').sort();

    for (var i = 0, length = this.models.length; i < length; i++) {
      var model = this.models[i];
      if (model.get('frames').length){
        var video_id = model.getFirstFrame().get('video').id;

        var viewedIndex = _.indexOf(sortedViewedVideosArray, video_id, true);
        var viewed = (viewedIndex != -1);
    
        if (viewed != model.get('collapsed')) {
          model.set({ collapsed : viewed });
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
  
      for (var j = 0; j < this.models.length && !dupe; j++) {
         if (this.models[j].getFirstFrame().get('video').id == video_id) {
            this.models[j].add(frame, dashboard_entry, options);
            dupe = true;
         }
      }
  
      if (!dupe) {
         var frameGroup = new libs.shelbyGT.FrameGroupModel();
         frameGroup.add(frame, dashboard_entry, options);
  
         var viewed = shelby.models.viewedVideos.get('viewed_videos').find(function(entry){
           return entry.id == frame.get('video').id;
         });
  
         if (viewed) {
           frameGroup.set({ collapsed : true }, options);
         }
  
         Backbone.Collection.prototype.add.call(this, frameGroup, options);
      }
    }

    return this;
  },

  getNextPlayableFrame : function(currentFrame, skip) {
    var nextPlayableFrameGroup = this._findNextPlayableFrameGroup(currentFrame, skip);
    if (nextPlayableFrameGroup) {
      return nextPlayableFrameGroup.getFirstFrame();
    } else {
      // if we can't find another playable frame group in the direction we're looking,
      // we return to the beginning of the roll or stream
      return this.at(0).getFirstFrame();
    }
  },

  _findNextPlayableFrameGroup : function(currentFrame, skip) {
    var _index = -1,
        _currentFrameGroupIndex = -1;

    // look for a frame group that contains the currently playing frame
    var _matchingFrameGroup = this.find(function(frameGroup){
      return frameGroup.get('frames').any(function(frame){
        return frame.id == currentFrame.id;
      });
    });
    if (_matchingFrameGroup) {
      _currentFrameGroupIndex = this.indexOf(_matchingFrameGroup);
      _index = _currentFrameGroupIndex + skip;
    } else {
      _currentFrameGroupIndex = 0;
    }

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
