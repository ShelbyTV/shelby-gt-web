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
			var defaults = {};
			if (options["route"] == "add_to_watch_later") {
	      defaults = {
	        url : shelby.config.apiRoot + '/frame/' + model.get('original_frame_id') + '/add_to_watch_later'
	      };
			}
			else if (options["route"] == "upvote"){
				defaults = {
	        url : shelby.config.apiRoot + '/frame/' + model.get('original_frame_id') + '/upvote'
	      };
			}

      _(options).defaults(defaults);
    }

    Backbone.sync.call(this, method, model, options);
  },
	
  saveToWatchLater : function(onSuccess) {
    var frameToReroll = new libs.shelbyGT.FrameModel();
    frameToReroll.set('original_frame_id', this.id);
    frameToReroll.save(null, {route: "add_to_watch_later", success: onSuccess});
  },

	upvote : function(onSuccess) {
		var frameToUpvote = new libs.shelbyGT.FrameModel();
    frameToUpvote.set('original_frame_id', this.id);
    frameToUpvote.save(null, {route: "upvote", success:onSuccess});
	}

});
