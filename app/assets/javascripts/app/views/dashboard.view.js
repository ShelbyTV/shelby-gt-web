( function(){

  // shorten names of included library prototypes
  var DashboardEmptyIndicatorView = libs.shelbyGT.DashboardEmptyIndicatorView;
  var FrameGroupPlayPagingListView = libs.shelbyGT.FrameGroupPlayPagingListView;
  var SmartRefreshCheckType = libs.shelbyGT.SmartRefreshCheckType;

  libs.shelbyGT.DashboardView = FrameGroupPlayPagingListView.extend({

    className : FrameGroupPlayPagingListView.prototype.className + ' dashboard stream',

    options : _.extend({}, FrameGroupPlayPagingListView.prototype.options, {
      collectionAttribute : 'dashboard_entries',
      doCheck : SmartRefreshCheckType.headAndTail,
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
    }

  });

} ) ();
