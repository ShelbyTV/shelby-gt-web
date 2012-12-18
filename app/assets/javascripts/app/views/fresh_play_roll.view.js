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
      // need to set the comparator on this.model b/c the "first" item in there is used to start playing videos...
      this.model.get('frames').comparator = this.options.comparator;

      // the "new" frames kee their score
      // the old frames get score adjusted
      //    but score stays within the max + min of what was loaded so we don't fuck with what's currently rendered
      
      // group 1: the stuff we want to stay at the top
      // group 2: the rest of the stuff we loaded initially
      // group 3: the first "load more"
      // group 4: the next "load more"
      // etc...
      // each group of frames gets random scores that are always smaller than what we've already loaded
      
      //Math.seedrandom(Math.round((new Date()).getTime()/(1000*60*60*24*7))) // 7 should be configurable as "consistencyTimeFrame"
      //then use Math.random()
      
      // Intercepting parse() and adjusting scores before anybody sees them, so our comparator just works
      // TODO: do this for real and use a seeded math random (and all the algo from above)
      this.model.parse = function (response) {
        console.log("successfully intercepted the parse", response.result, this.get('frames').length);
        // this refers to our model, not the view
        // Proof Of Concept
        response.result.frames[2].score = 100;
        return response.result;
      };
      
                
      FrameGroupPlayPagingListView.prototype.initialize.call(this);
    },

    _cleanup : function(){
      FrameGroupPlayPagingListView.prototype._cleanup.call(this);
    },

    options : _.extend({}, FrameGroupPlayPagingListView.prototype.options, {
      collectionAttribute : 'frames',
      collapseViewedFrameGroups : false,  //don't collapse on a .tv
      emptyIndicatorViewProto : null,     //used on watch later roll
      
      //XXX temporarily turning off roll promos
      isIntervalComplete : function(displayedItems) {
        return false;
      },
      listItemView : 'FrameGroupView',
      fetchParams : {
        include_children : true
      },
      firstFetchLimit : shelby.config.pageLoadSizes.roll,
      limit : shelby.config.pageLoadSizes.roll + 1, // +1 b/c fetch is inclusive of frame_id sent to skip
      
      // FreshPlay config
      freshPlayEnabled : true,
      //just ordering based on score, which is changed ?WHERE? (elsewhere)
      comparator : function(m){ 
        //this comparator is used in the collection (where model is a Frame) 
        //and in the display collection (where model is a FrameGroup) so we gotta do this... ugh...
        return (typeof(m.getFirstFrame) === "function" ? m.getFirstFrame().get('score') : m.get('score'));
      },
      
    }),

    _doesResponseContainListCollection : function(response) {
      return response.result.frames;
    },


  });

} ) ();
