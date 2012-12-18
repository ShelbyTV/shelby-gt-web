/*
 * Displays "new" frames first, then a consistent random ordering of Frames to keep playback fresh.
 *  "New" means stuff posted in the last X days, or a minimum of M frames going back futher (both configurable).
 *  "Consistent random" means that for all viewers for a given time frame, frames will be in the same order (time frame configurable).
 *
 * Implementation is very similar to RollView, but adds a comparator to enable FreshPlay algorithm.
 *
 * Things I'm not happy about:
 *  - The roll promo stuff is duplicated from roll.view.js (maybe RollView becomes WathcLaterRollView; this is for all other rolls)
 *
 */

( function(){

  // shorten names of included library prototypes
  var FrameGroupPlayPagingListView = libs.shelbyGT.FrameGroupPlayPagingListView;
  var InlineExplorePromoView = libs.shelbyGT.InlineExplorePromoView;

  libs.shelbyGT.FreshPlayRollView = FrameGroupPlayPagingListView.extend({

    className : FrameGroupPlayPagingListView.prototype.className + ' roll fresh-play-enabled',

    initialize : function(){
      
      console.log("*** FreshPlayRollView initializing... ***");
      
      //options.comparator affects ListView (at very top of inheritance stack)
      //TODO: set comparator in options, below
                
                
      FrameGroupPlayPagingListView.prototype.initialize.call(this);
      if (this._lookupDonatePromo()) {
        //if the roll has a donate promo, increase the promo frequency
        this.options.isIntervalComplete = function(displayedItems) {
          return displayedItems != 0;
        };
      }
    },

    _cleanup : function(){
      FrameGroupPlayPagingListView.prototype._cleanup.call(this);
    },

    options : _.extend({}, FrameGroupPlayPagingListView.prototype.options, {
      collectionAttribute : 'frames',
      freshPlayEnabled : true,
      collapseViewedFrameGroups : false,  //don't collapse on a .tv
      emptyIndicatorViewProto : null,     //used on watch later roll
      isIntervalComplete : function(displayedItems) {
        return displayedItems != 0 && displayedItems % 5 == 0;
      },
      listItemView : 'FrameGroupView',
      fetchParams : {
        include_children : true
      },
      firstFetchLimit : shelby.config.pageLoadSizes.freshPlayRoll,
      limit : shelby.config.pageLoadSizes.freshPlayRoll + 1, // +1 b/c fetch is inclusive of frame_id sent to skip
    }),

    _doesResponseContainListCollection : function(response) {
      return response.result.frames;
    },

    // FrameGroupPlayPagingListView overrides
    _filterPromoRolls : function(roll) {
      //don't show a promo for the roll that you're currently looking at
      // return (roll.has('id') && roll.id != this.model.id && roll.has('display_title') && roll.has('display_thumbnail_src'));
      //TEMPRORARY ITS OK TO SHOW BECAUSE IT WILL BE A DONATE PROMO
      return (roll.has('id') && roll.has('display_title') && roll.has('display_thumbnail_src'));
    },

    _lookupDonatePromo : function() {
      self = this;
      return _(shelby.config.donatePromos).find(function(promoInfo) {
        return promoInfo.rollId == self.model.id;
      });
    }

  });

} ) ();
