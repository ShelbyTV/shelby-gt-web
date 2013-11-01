( function(){

  // shorten names of included library prototypes
  var DashboardEmptyIndicatorView = libs.shelbyGT.DashboardEmptyIndicatorView;
  var FrameGroupPlayPagingListView = libs.shelbyGT.FrameGroupPlayPagingListView;
  var SmartRefreshCheckType = libs.shelbyGT.SmartRefreshCheckType;
  var recommendationPlacer = libs.utils.recommendationPlacer;

  libs.shelbyGT.DashboardView = FrameGroupPlayPagingListView.extend({

    className : FrameGroupPlayPagingListView.prototype.className + ' dashboard stream',

    options : _.extend({}, FrameGroupPlayPagingListView.prototype.options, {
      collectionAttribute : 'dashboard_entries',
      doCheck : SmartRefreshCheckType.headAndTail,
      doLoadRecommendationsPerPage : false, // whether or not new recommendations should be fetched and inserted into each newly loaded page
                                            // of dashboard entries
      doSmartRefresh : true,
      emptyIndicatorViewProto : DashboardEmptyIndicatorView,
      mobileVideoFilter : function(dbEntry) {
          return dbEntry.get('frame').get('video').canPlayMobile();
      },
      initFixedHead : true,
      isIntervalComplete : function(displayedItems) {
        return displayedItems != 0 && displayedItems % 5 == 0;
      },
      fetchParams : {
        include_children : true
      },
      sortOrder : -1
    }),

    //actionToViewMap : use this if your dashboard entry action needs a different view than FrameGroupView
    // it's evaluated using _.result(), so it can be set to either an object or a function that returns an object
    actionToViewMap : {
      /* example override:
      0 : libs.ShelbyGT.SomeView
      */
    },

    initialize : function(){
      var self = this;

      _(this.options).extend({
        listItemView : function(item, params){

          var mapResult = _(self).result('actionToViewMap')[item.get('primaryDashboardEntry').get('action')] || libs.shelbyGT.FrameGroupView;
          return new mapResult(_(params).extend({model:item}));
        }
      });
      FrameGroupPlayPagingListView.prototype.initialize.call(this);
    },

    _doesResponseContainListCollection : function(response) {
      return $.isArray(response.result);
    },

    // PagingListView overrides
    _onFetchSuccess : function(model, response, numItemsDisplayedBeforeCurrentPage) {
      FrameGroupPlayPagingListView.prototype._onFetchSuccess.call(this, model, response, numItemsDisplayedBeforeCurrentPage);

      // if the option has been specified, fetch some more recommendations and insert them in the newly loaded page
      // of dashboard entries
      if (this.options.doLoadRecommendationsPerPage) {
        var self = this;
        // get the ids of the videos that have already been recommended in the stream in this session
        var recommendedVideoIds = this._simulatedMasterCollection.chain().filter(function(dbe){
          return dbe.isRecommendationEntry();
        }).map(function(dbe){
          return dbe.get('frame').get('video').id;
        }).value();
        // prepare the parameters for the API request
        var requestData = {
          limits: shelby.config.recommendations.limits.morePages,
          min_score: shelby.config.recommendations.videoGraph.minScore,
          scan_limit: shelby.config.recommendations.videoGraph.dashboardScanLimit,
          sources: shelby.config.recommendations.sources.morePages
        };
        // tell the api which videos we've already recommended during this session so it doesn't
        // recommend them again on later pages
        if (recommendedVideoIds.length) {
          requestData['excluded_video_ids'] = recommendedVideoIds.join(",");
        }
        shelby.collections.dynamicRecommendations.fetch({
          add : true,
          data : requestData,
          success : function(dynamicRecommendationsCollection, response) {
            recommendationPlacer.placeRecs(
              shelby.collections.dynamicRecommendations,
              self.options.collection ? self.options.collection : self.model.get(self.options.collectionAttribute),
              self.frameGroupCollection,
              numItemsDisplayedBeforeCurrentPage
            );
          }
        });
      }
    }

  });

} ) ();
