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

    for (i = 0, length = this.models.length; i < length; i++) {
      var model = this.models[i];
      var video_id = model.get('frames').at(0).get('video').get('id');

      var viewedIndex = _.indexOf(sortedViewedVideosArray, video_id, true);
      var viewed = (viewedIndex != -1);
  
      if (viewed != model.get('collapsed')) {
        model.set({ collapsed : viewed });
      }
    }
  },

  add: function(models, options) {

    options || (options = {});

    models = _.isArray(models) ? models.slice() : [models];

    for (i = 0, length = models.length; i < length; i++) {
      model = models[i];

      var video_id,
          frame,
          dashboard_entry;
  
      // TODO: need to deal with null frame, null video, etc. in both cases
      if (model instanceof libs.shelbyGT.DashboardEntryModel) {
        video_id = model.get('frame').get('video').get('id');
        frame = model.get('frame');
        dashboard_entry = model;
      } else if (model instanceof libs.shelbyGT.FrameModel) {
        video_id = model.get('video').get('id');
        frame = model;
        dashboard_entry = null;
      } else {
        continue;
      }
  
      var dupe = false;
  
      for (var j = 0; j < this.models.length && !dupe; j++) {
         if (this.models[j].get('frames').at(0).get('video').get('id') == video_id) {
            this.models[j].add(frame, dashboard_entry, options);
            dupe = true;
         }
      }
  
      if (!dupe) {
         var frameGroup = new libs.shelbyGT.FrameGroupModel;
         frameGroup.add(frame, dashboard_entry, options);
  
         var viewed = shelby.models.viewedVideos.get('viewed_videos').find(function(entry){
           return entry.id == frame.get('video').get('id');
         });
  
         if (viewed) {
           frameGroup.set({ collapsed : true }, options);
         }
  
         Backbone.Collection.prototype.add.call(this, frameGroup, options);
      } 
    }

    return this;
  }

});
