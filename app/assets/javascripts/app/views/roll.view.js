( function(){

  // shorten names of included library prototypes
  var FrameGroupPlayPagingListView = libs.shelbyGT.FrameGroupPlayPagingListView;
  var InlineExplorePromoView = libs.shelbyGT.InlineExplorePromoView;
  var PlaylistType = libs.shelbyGT.PlaylistType;

  libs.shelbyGT.RollView = FrameGroupPlayPagingListView.extend({

    className : FrameGroupPlayPagingListView.prototype.className + ' roll',

    initialize : function(){
      FrameGroupPlayPagingListView.prototype.initialize.call(this);
      if (this.model.id == shelby.models.user.get('watch_later_roll_id')) {
        this.frameGroupCollection.bind('destroy', this._onQueueFrameGroupDestroyed, this);
        //if this is the queue don't show any promos
        this.options.isIntervalComplete = function(displayedItems) {
          return false;
        };
      } else if (this._lookupDonatePromo()) {
        //if the roll has a donate promo, increase the promo frequency
        this.options.isIntervalComplete = function(displayedItems) {
          return displayedItems != 0 && displayedItems % 4 == 0;
        };
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
        return displayedItems != 0 && displayedItems % 5 == 0;
      },
      listItemView : 'FrameGroupView',
      fetchParams : {
        include_children : true
      },
      playlistType : PlaylistType.roll
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

    _filterPromoRolls : function(roll) {
      //don't show a promo for the roll that you're currently looking at
      // return (roll.has('id') && roll.id != this.model.id && roll.has('display_title') && roll.has('display_thumbnail_src'));
      //TEMPRORARY ITS OK TO SHOW BECAUSE IT WILL BE A DONATE PROMO
      return (roll.has('id') && roll.has('display_title') && roll.has('display_thumbnail_src'));
    },

    _lookupDonatePromo : function() {
      var self = this;
      return _(shelby.config.donatePromos).find(function(promoInfo) {
        return promoInfo.rollId == self.model.id;
      });
    }

  });

} ) ();
