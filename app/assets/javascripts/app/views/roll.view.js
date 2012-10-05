( function(){

  // shorten names of included library prototypes
  var FrameGroupPlayPagingListView = libs.shelbyGT.FrameGroupPlayPagingListView;
  var InlineExplorePromoView = libs.shelbyGT.InlineExplorePromoView;

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
      isIntervalComplete : function(displayedItems) {
        return displayedItems != 0 && displayedItems % 30 == 0;
      },
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
    },

    // FrameGroupPlayPagingListView overrides
    _filterPromoRolls : function(roll) {
      //don't show a promo for the roll that you're currently looking at
      return (roll.has('id') && roll.id != this.model.id && roll.has('display_title') && roll.has('display_thumbnail_src'));
    }

  });

} ) ();
