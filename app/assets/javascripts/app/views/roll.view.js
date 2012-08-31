( function(){

  // shorten names of included library prototypes
  var FrameGroupPlayPagingListView = libs.shelbyGT.FrameGroupPlayPagingListView;

  libs.shelbyGT.RollView = FrameGroupPlayPagingListView.extend({

    className : FrameGroupPlayPagingListView.prototype.className + ' roll',

    initialize : function(){
      FrameGroupPlayPagingListView.prototype.initialize.call(this);
      if (this.model.id == shelby.models.user.get('watch_later_roll_id')) {
        this.frameGroupCollection.bind('destroy', this._onQueueFrameGroupDestroyed, this);
      }
    },

    _cleanup : function(){
      FrameGroupPlayPagingListView.prototype._cleanup.call(this);
      if (this.model.id == shelby.models.user.get('watch_later_roll_id')) {
        this.frameGroupCollection.unbind('destroy', this._onQueueFrameGroupDestroyed, this);
      }
    },

    options : _.extend({}, FrameGroupPlayPagingListView.prototype.options, {
      collectionAttribute : 'frames',
      listItemView : 'FrameGroupView',
      fetchParams : {
        include_children : true
      }
    }),

    _onQueueFrameGroupDestroyed : function(frameGroupModel, frameGroupsCollection, options) {
      // if the frame group being destroyed is from the Queue/Watch Later roll, we need to remove its video
      // from our local collection tracking which videos are queued
      var frameVideo = frameGroupModel.getFirstFrame().get('video');
      if (frameVideo) {
        var queuedVideo = shelby.models.queuedVideos.get('queued_videos').get(frameVideo.id);
        if (queuedVideo) {
          shelby.models.queuedVideos.get('queued_videos').remove(queuedVideo);
        }
      }
    },

    _doesResponseContainListCollection : function(response) {
      return response.result.frames;
    }

  });

} ) ();
