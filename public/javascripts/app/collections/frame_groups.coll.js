libs.shelbyGT.FrameGroupsCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.FrameGroupModel,

  add: function(models, options) {

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
  
      for (var i = 0; i < this.models.length && !dupe; i++) {
         if (this.models[i].get('frames').at(0).get('video').get('id') == video_id) {
            this.models[i].add(frame, dashboard_entry);
            dupe = true;
         }
      }
  
      if (!dupe) {
         var frameGroup = new libs.shelbyGT.FrameGroupModel;
         frameGroup.add(frame, dashboard_entry);
  
         var viewed = shelby.models.viewedVideos.get('viewed_videos').find(function(entry){
           return entry.id == frame.get('video').get('id');
         });
  
         if (viewed) {
           frameGroup.set('collapsed', true);
         }
  
         Backbone.Collection.prototype.add.call(this, frameGroup, options);
      } 
    }

    return this;
  }

});
