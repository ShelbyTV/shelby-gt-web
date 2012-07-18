( function(){

  // shorten names of included library prototypes
  var FramePlayPagingListView = libs.shelbyGT.FramePlayPagingListView;
  var SmartRefreshCheckType = libs.shelbyGT.SmartRefreshCheckType;

  libs.shelbyGT.DashboardView = FramePlayPagingListView.extend({

    className : FramePlayPagingListView.prototype.className + ' dashboard',

    options : _.extend({}, FramePlayPagingListView.prototype.options, {
      collectionAttribute : 'dashboard_entries',
      doCheck : SmartRefreshCheckType.headAndTail,
      doSmartRefresh : true,
      initFixedHead : true,
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
          var mapResult = self.actionToViewMap[item.primaryDashboardEntry.get('action')];
          return new mapResult.view(_(params).extend({model:item}));
        }
      });
      FramePlayPagingListView.prototype.initialize.call(this);
    },

    _filter : function(item){
      return item;
    },

    _doesResponseContainListCollection : function(response) {
      return $.isArray(response.result);
    },

    _doesListItemMatchFrame : function(itemModel, activeFrameModel) {
      return itemModel.has('frame') && itemModel.get('frame').id == activeFrameModel.id;
    }

  });

} ) ();
