libs.shelbyGT.FrameGroupsCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.FrameGroupModel,

  add: function(models, options) {

    if (models instanceof Array) {
       // We don't support this...
       return;
    }

    var video_id,
        frame,
        dashboard_entry;

    // TODO: need to deal with null frame, null video, etc. in both cases
    if (models instanceof libs.shelbyGT.DashboardEntryModel) {
      video_id = models.get('frame').get('video').get('id');
      frame = models.get('frame');
      dashboard_entry = models;
    } else if (models instanceof libs.shelbyGT.FrameModel) {
      provider_id = models.get('video').get('id');
      frame = models;
      dashboard_entry = null;
    } else {
      return;
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

       return Backbone.Collection.prototype.add.call(this, frameGroup, options);
    } else {
       return;
    }
  }

});
