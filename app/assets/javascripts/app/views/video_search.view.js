( function(){

  // shorten names of included library prototypes
  var FrameGroupPlayPagingListView = libs.shelbyGT.FrameGroupPlayPagingListView;
  var InlineExplorePromoView = libs.shelbyGT.InlineExplorePromoView;

  libs.shelbyGT.VideoSearchView = FrameGroupPlayPagingListView.extend({

    className : FrameGroupPlayPagingListView.prototype.className + ' roll',

    initialize : function(){
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
      isIntervalComplete : function(displayedItems) {
        return displayedItems != 0 && displayedItems % 5 == 0;
      },
      listItemView : 'FrameGroupView',
      fetchParams : {
        include_children : true
      }
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
      return null;
    }

  });

} ) ();
