/*
 * Displays "new" frames first, then a consistent random ordering of Frames to keep playback fresh.
 *  "New" means stuff posted in the last X days, or a minimum of M frames going back futher (both configurable).
 *  "Consistent random" means that for all viewers for a given time frame, frames will be in the same order (time frame configurable).
 * (Implementation is very similar to RollView, but adds a comparator and re-scores frames to enable FreshPlay algorithm)
 *
 * We should end up with the Frames on the Roll looking something like this:
 *
 * [new1, new2, ..., newN]
 * [fresh1, fresh2, fresh3, ..., freshN]
 * ==LOAD MORE==
 * [freshN+1, freshN+2, ..., freshN+M]
 * ==LOAD MORE==
 * [freshN+M+1, freshN+M+2, ..., freshN+M+Z]
 * etc.
 *
 * Where each "fresh group" is internally random but doesn't overlap other fresh groups, 
 * thereby keeping the Load More experience nice (would be jarring if load more inserted throughout the roll).
 *
 * NB: We're only as random as the roll page load size, so it's been increased.
 *
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
      // need to set the comparator on model's collection b/c the "first" item in there is used to start playing videos...
      this.model.get('frames').comparator = this.options.comparator;

      // make the magic happen (in conjuction w/ the comparator from options)
      this._engageReScoring();
                
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
      
      // for how many days should the reandom reorder stay consistent
      reorderingConsistencyDays : 1,
      
      // Keep frames created less then newFramesMaxAgeDays days as "new"
      newFramesMaxAgeDays : 5,
      // Always have this many "new" Frames at the top of the roll
      newFramesMinCount : 1,
      
      // ordering based on score, which is changed by fresh play algo, using the options above
      comparator : function(m){ 
        //this comparator is used in the collection (where model is a Frame) 
        //and in the display collection (where model is a FrameGroup) so we gotta do this... ugh...
        return 1-(typeof(m.getFirstFrame) === "function" ? m.getFirstFrame().get('score') : m.get('score'));
      },
      
    }),
    
    _engageReScoring: function(){
      //seeding random number generator with a unique seed every X days
      Math.seedrandom('ds'+Math.round(Date.now()/(1000*60*60*24*this.options.reorderingConsistencyDays)));
      
      var fpParams = {
        /* Store a seed between runs for consistency (in case Math.seededRandom() gets called elsewhere)
         */
        seed: null,
        
        /* We maintain a range of scores for each group in [groupLowScore, groupHighScore)
         * such that when the next group comes through parse, we can give that group lower scores
         * and keep them all below the already displayed groups.
         *
         * It would be jarring if the newly loaded group was interleaved with the currently displayed frames.
         */
        groupHighScore: 1000000,
        groupLowScore:   999900,
        
        /* Paging uses since_id, and the API returns frames inclusive of the since_id frame.
         * We need to make sure we give this overlap-Frame the same score each time, or things go haywire.
         */
        lastFrameId: null,
        lastFrameScore: null,
        
        /* Keep Frames newer than this.options.maxAgeNewFrames days old as "new" Frames.
         * And make sure we always have at least newFramesMinCount "new" Frames.
         */
        newFramesCount: 0,
        newFramesLastScore: 2000000,
        newFramesMinCount: this.options.newFramesMinCount,
        newFramesMinAge: Date.now() - (1000*60*60*24*this.options.newFramesMaxAgeDays),
      };
      
      this.model.parse = function (response) {
        //NB: in context of this function, `this` refers to our model, not the view
                
        if(fpParams.seed !== null) Math.seedrandom(fpParams.seed);
        
        // give all the frames a score in [groupLowScore, groupHighScore)
        // remember: Math.seededRandom() returns a random double in [0, 1)
        // also need to give the overlap-frame the same score (see fpParams discussion)
        var scoreRange = fpParams.groupHighScore - fpParams.groupLowScore,
        newScore;
        _.each(response.result.frames, function(frameJson){
          // "new" frame handling
          if(fpParams.newFramesCount < fpParams.newFramesMinCount ||
            libs.shelbyGT.viewHelpers.app.timestampFromMongoId(frameJson.id) > fpParams.newFramesMinAge){
              frameJson.score = fpParams.newFramesLastScore--;
              frameJson.isFreshPlayNew = true;
              fpParams.newFramesCount++;
              return;
          }
          
          // "old" frame handling
          if(frameJson.id == fpParams.lastFrameId){
            newScore = fpParams.lastFrameScore;
          } else {
            newScore = fpParams.groupLowScore + (scoreRange*Math.seededRandom());
          }
          frameJson.score = fpParams.lastFrameScore = newScore;
          frameJson.isFreshPlayNew = false;
          fpParams.lastFrameId = frameJson.id;
        });
        
        //update parameters for next run
        fpParams.seed = 'ds'+Math.seededRandom();
        fpParams.groupHighScore = fpParams.groupLowScore;
        fpParams.groupLowScore = fpParams.groupLowScore - scoreRange;
        
        return response.result;
      };
    },

    _doesResponseContainListCollection : function(response) {
      return response.result.frames;
    },


  });

} ) ();
