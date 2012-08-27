( function(){

  // shorten names of included library prototypes
  var FramePlayPagingListView = libs.shelbyGT.FramePlayPagingListView;

  libs.shelbyGT.RollView = FramePlayPagingListView.extend({

    frameGroupCollection : null,

    className : FramePlayPagingListView.prototype.className + ' roll',

    initialize : function(){
      this.frameGroupCollection = new libs.shelbyGT.FrameGroupsCollection();
      _(this.options).extend({
        displayCollection: this.frameGroupCollection
      });

      if (this.model.id == shelby.models.user.get('watch_later_roll_id')) {
        this.model.get('frames').bind('destroy', this._onQueueFrameDestroyed, this);
      }

      FramePlayPagingListView.prototype.initialize.call(this);
    },

    _cleanup : function(){
      if (this.model.id == shelby.models.user.get('watch_later_roll_id')) {
        this.model.get('frames').unbind('destroy', this._onQueueFrameDestroyed, this);
      }
    },

    options : _.extend({}, FramePlayPagingListView.prototype.options, {
      collectionAttribute : 'frames',
      listItemView : 'FrameGroupView',
      fetchParams : {
        include_children : true
      }
    }),

    _onQueueFrameDestroyed : function(frameModel, framesCollection, response) {
      // if the frame being destroyed is from the Queue/Watch Later roll, we need to remove its video
      // from our local collection tracking which videos are queued
      var frameVideo = frameModel.get('video');
      if (frameVideo) {
        var queuedVideo = shelby.models.queuedVideos.get('queued_videos').get(frameVideo.id);
        if (queuedVideo) {
          shelby.models.queuedVideos.get('queued_videos').remove(queuedVideo);
        }
      }
    },

    _doesResponseContainListCollection : function(response) {
      return response.result.frames;
    },

    _doesListItemMatchFrame : function(itemModel, activeFrameModel) {
      return itemModel.id == activeFrameModel.id;
    }

  });

} ) ();
