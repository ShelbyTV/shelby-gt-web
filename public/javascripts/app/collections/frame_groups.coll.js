libs.shelbyGT.FrameGroupsCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.FrameGroupModel,

  add: function(models, options) {

    if (models instanceof Array) {
       // We don't support this...
       return;
    }

    var provider_name,
        provider_id,
        frame,
        dashboard_entry;

    // TODO: need to deal with null frame, null video, etc. in both cases
    if (models instanceof libs.shelbyGT.DashboardEntryModel) {

      provider_name = models.get('frame').get('video').get('provider_name');
      provider_id = models.get('frame').get('video').get('provider_id');
      frame = models.get('frame');
      dashboard_entry = models;

    } else if (models instanceof libs.shelbyGT.FrameModel) {

      provider_name = models.get('video').get('provider_name');
      provider_id = models.get('video').get('provider_id');
      frame = models;
      dashboard_entry = null;

    } else {

      return;

    }

    var dupe = false;

    for (var i = 0; i < this.models.length && !dupe; i++) {

       if (this.models[i].get('frames').at(0).get('video').get('provider_id') == provider_id &&
           this.models[i].get('frames').at(0).get('video').get('provider_name') == provider_name) {

          this.models[i].add(frame, dashboard_entry);
          dupe = true;
       }

    }

    if (!dupe) {

       var frameGroup = new libs.shelbyGT.FrameGroupModel;
       frameGroup.add(frame, dashboard_entry);

       return Backbone.Collection.prototype.add.call(this, frameGroup, options);
    } else {
       return;
    }
  }

});
