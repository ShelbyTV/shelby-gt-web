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
      var self = this;

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
            self._handleSearchResults(youtubeSearchModel);
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
            self._handleSearchResults(vimeoSearchModel);
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
            self._handleSearchResults(dailymotionSearchModel);
          }
        });
      }
    },

    _handleSearchResults : function(searchModel) {
      searchModel.assignScores();
      var frames = searchModel.getVideosWrappedInFrames();
      var activeFrameModel = shelby.models.guide.get('activeFrameModel');
      if (!activeFrameModel) {
        //if we're going to play the first frame, artificially drop its score
        //this is so it can't be displaced from the top of the list when more frames arrive from
        //other API calls
        var firstFrame = frames[0];
        if (firstFrame) {
          firstFrame.get('video').set('score', -1);
        }
      } else {
        //if we're already playing one of the frames, also drop its score so it will appear at the top
        var playingFrame = _(frames).find(function(frame){
          return frame.get('video').id == activeFrameModel.id;
        });
        if (playingFrame) {
          playingFrame.get('video').set('score', -1);
        }
      }
      shelby.collections.videoSearchResultFrames.add(frames);
      //if nothing is already playing, start playing the first video in the search results
      if (!activeFrameModel) {
        // don't want to activate the video if we've switched to explore view during the asynchronous load
        if (shelby.models.guide.get('displayState') != libs.shelbyGT.DisplayState.explore) {
          var firstFrame = shelby.collections.videoSearchResultFrames.first();
          if (firstFrame) {
            shelby.models.guide.set('activeFrameModel', firstFrame);
          }
        }
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
