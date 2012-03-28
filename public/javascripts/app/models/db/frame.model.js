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
    }
  ],

  url : function() {
    return shelby.config.apiRoot + '/frame/' + this.id;
  },

  // when re-rolling/creating a frame, the roll to re-roll to will be determined
  // by the 'roll_id' attribute of the frame model
  sync : function(method, model, options) {
    if (method == 'create') {
      // perform some magic to hit a non-standard CRUD route for creating
      // a new frame (which we also call re-rolling)
      var defaults = {
        url : shelby.config.apiRoot + '/frame/' + model.get('original_frame_id') + '/add_to_watch_later'
      };
      _(options).defaults(defaults);
    }

    Backbone.sync.call(this, method, model, options);
  },

  saveToWatchLater : function() {
    var frameToReroll = new libs.shelbyGT.FrameModel();
    frameToReroll.set('original_frame_id', this.id);
    frameToReroll.save();
  }

});
