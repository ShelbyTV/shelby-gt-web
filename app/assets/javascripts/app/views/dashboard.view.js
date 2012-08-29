( function(){

  // shorten names of included library prototypes
  var FrameGroupPlayPagingListView = libs.shelbyGT.FrameGroupPlayPagingListView;
  var SmartRefreshCheckType = libs.shelbyGT.SmartRefreshCheckType;

  libs.shelbyGT.DashboardView = FrameGroupPlayPagingListView.extend({

    className : FrameGroupPlayPagingListView.prototype.className + ' dashboard',

    options : _.extend({}, FrameGroupPlayPagingListView.prototype.options, {
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
      this.frameGroupCollection = new libs.shelbyGT.FrameGroupsCollection();

      _(this.options).extend({
        listItemView : function(item, params){
          var mapResult = self.actionToViewMap[item.get('primaryDashboardEntry').get('action')];
          return new mapResult.view(_(params).extend({model:item}));
        },
        displayCollection: this.frameGroupCollection
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
