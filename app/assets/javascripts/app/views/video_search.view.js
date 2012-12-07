( function(){

  // shorten names of included library prototypes
  var FrameGroupPlayPagingListView = libs.shelbyGT.FrameGroupPlayPagingListView;
  var InlineExplorePromoView = libs.shelbyGT.InlineExplorePromoView;

  libs.shelbyGT.VideoSearchView = FrameGroupPlayPagingListView.extend({

    className : FrameGroupPlayPagingListView.prototype.className + ' roll',

    options : _.extend({}, FrameGroupPlayPagingListView.prototype.options, {
      listItemView : 'FrameGroupView',
      fetchParams : {
        include_children : true
      }
    }),

    initialize : function(){
      FrameGroupPlayPagingListView.prototype.initialize.call(this);
      this.options.videoSearchModel.bind("search", this._doSearch, this);
    },

    _cleanup : function(){
      FrameGroupPlayPagingListView.prototype._cleanup.call(this);
      this.options.videoSearchModel.unbind("search", this._doSearch, this);
    },

    render : function(){
      FrameGroupPlayPagingListView.prototype.render.call(this);
      if (this.options.videoSearchModel.get('query')) {
        shelby.router.navigate('search?query=' + encodeURIComponent(this.options.videoSearchModel.get('query')), {trigger: false, replace: true});
      }
    },

    _doSearch : function(){
      if (this.options.videoSearchModel.get('query')) {
        shelby.router.navigate('search?query=' + encodeURIComponent(this.options.videoSearchModel.get('query')), {trigger: false});
        this.collection.reset();
        //youtube search
        var youtubeSearchModel = new libs.shelbyGT.VideoSearchResultsModel();
        youtubeSearchModel.fetch({
          data : {
            provider : 'youtube',
            q : this.options.videoSearchModel.get('query'),
            limit : 10
          },
          success : function(youtubeSearchModel, response) {
            youtubeSearchModel.assignScores();
            var frames = youtubeSearchModel.getVideosWrappedInFrames();
            shelby.collections.videoSearchResultFrames.add(frames);
            //if nothing is already playing, start playing the first video in the search results
            if (!shelby.models.guide.get('activeFrameModel')) {
              // don't want to activate the video if we've switched to explore view during the asynchronous load
              if (shelby.models.guide.get('displayState') != libs.shelbyGT.DisplayState.explore) {
                var firstFrame = shelby.collections.videoSearchResultFrames.first();
                if (firstFrame) {
                  shelby.models.guide.set('activeFrameModel', firstFrame);
                }
              }
            }
          }
        });

        //vimeo search
        var vimeoSearchModel = new libs.shelbyGT.VideoSearchResultsModel();
        vimeoSearchModel.fetch({
          data : {
            provider : 'vimeo',
            q : this.options.videoSearchModel.get('query'),
            limit : 10
          },
          success : function(vimeoSearchModel, response) {
            vimeoSearchModel.assignScores();
            var frames = vimeoSearchModel.getVideosWrappedInFrames();
            shelby.collections.videoSearchResultFrames.add(frames);
            //if nothing is already playing, start playing the first video in the search results
            if (!shelby.models.guide.get('activeFrameModel')) {
              // don't want to activate the video if we've switched to explore view during the asynchronous load
              if (shelby.models.guide.get('displayState') != libs.shelbyGT.DisplayState.explore) {
                var firstFrame = shelby.collections.videoSearchResultFrames.first();
                if (firstFrame) {
                  shelby.models.guide.set('activeFrameModel', firstFrame);
                }
              }
            }
          }
        });
        
        //dailymotion search
        var dailymotionSearchModel = new libs.shelbyGT.VideoSearchResultsModel();
        dailymotionSearchModel.fetch({
          data : {
            provider : 'dailymotion',
            q : this.options.videoSearchModel.get('query'),
            limit : 10
          },
          success : function(dailymotionSearchModel, response) {
            dailymotionSearchModel.assignScores();
            var frames = dailymotionSearchModel.getVideosWrappedInFrames();
            shelby.collections.videoSearchResultFrames.add(frames);
            //if nothing is already playing, start playing the first video in the search results
            if (!shelby.models.guide.get('activeFrameModel')) {
              // don't want to activate the video if we've switched to explore view during the asynchronous load
              if (shelby.models.guide.get('displayState') != libs.shelbyGT.DisplayState.explore) {
                var firstFrame = shelby.collections.videoSearchResultFrames.first();
                if (firstFrame) {
                  shelby.models.guide.set('activeFrameModel', firstFrame);
                }
              }
            }
          }
        });
      }
    },

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
