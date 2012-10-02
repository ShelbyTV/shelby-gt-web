( function(){

  // shorten names of included library prototypes
  var DashboardEmptyIndicatorView = libs.shelbyGT.DashboardEmptyIndicatorView;
  var FrameGroupPlayPagingListView = libs.shelbyGT.FrameGroupPlayPagingListView;
  var SmartRefreshCheckType = libs.shelbyGT.SmartRefreshCheckType;
  var InStreamExplorePromoView = libs.shelbyGT.InStreamExplorePromoView;
  var InStreamRollPromoHeaderView = libs.shelbyGT.InStreamRollPromoHeaderView;
  var InStreamRollPromoItemView = libs.shelbyGT.InStreamRollPromoItemView;

  libs.shelbyGT.DashboardView = FrameGroupPlayPagingListView.extend({

    className : FrameGroupPlayPagingListView.prototype.className + ' dashboard stream',

    options : _.extend({}, FrameGroupPlayPagingListView.prototype.options, {
      collectionAttribute : 'dashboard_entries',
      doCheck : SmartRefreshCheckType.headAndTail,
      doSmartRefresh : true,
      emptyIndicatorViewProto : DashboardEmptyIndicatorView,
      initFixedHead : true,
      intervalInsertViews : function() {
        if (Math.random() < 0.5) {
          return new InStreamExplorePromoView();
        } else {
          return [new InStreamRollPromoHeaderView(), new InStreamRollPromoItemView()];
        }
      },
      isIntervalComplete : function(displayedItems) {
        return displayedItems != 0 && displayedItems % 15 == 0;
      },
      fetchParams : {
        include_children : true
      },
      sortOrder : -1
    }),

    actionToViewMap : {
      '0' : {view: libs.shelbyGT.FrameGroupView},
      '1' : {view: libs.shelbyGT.FrameGroupView},
      '2' : {view: libs.shelbyGT.FrameGroupView},
      '8' : {view: libs.shelbyGT.FrameGroupView},
      '9' : {view: libs.shelbyGT.FrameGroupView},
      '10' : {view: libs.shelbyGT.FrameGroupView}
    },


    initialize : function(){
      var self = this;

      _(this.options).extend({
        listItemView : function(item, params){
          var mapResult = self.actionToViewMap[item.get('primaryDashboardEntry').get('action')];
          return new mapResult.view(_(params).extend({model:item}));
        }
      });
      FrameGroupPlayPagingListView.prototype.initialize.call(this);
    },

    _filter : function(item){
      return item;
    },

    _doesResponseContainListCollection : function(response) {
      return $.isArray(response.result);
    }

  });

} ) ();
