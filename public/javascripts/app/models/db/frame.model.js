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

  // when re-rolling/creating a frame, the roll to re-roll to will be determined
  // by the 'roll_id' attribute of the frame model
  sync : function(method, model, options) {
    if (method == 'create') {
      // perform some magic to hit a non-standard CRUD route for creating
      // a new frame (which we also call re-rolling)
      var defaults = {
        url : shelby.config.apiRoot + '/roll/' + model.get('roll_id') + '/frames'
      };
      _(options).defaults(defaults);
    }

    Backbone.sync.call(this, method, model, options);
  }
});
