( function(){

  // shorten names of included library prototypes
  var DashboardEmptyIndicatorView = libs.shelbyGT.DashboardEmptyIndicatorView;
  var FrameGroupPlayPagingListView = libs.shelbyGT.FrameGroupPlayPagingListView;
  var SmartRefreshCheckType = libs.shelbyGT.SmartRefreshCheckType;
  var InStreamExplorePromoView = libs.shelbyGT.InStreamExplorePromoView;
  var InStreamRollPromoView = libs.shelbyGT.InStreamRollPromoView;

  libs.shelbyGT.DashboardView = FrameGroupPlayPagingListView.extend({

    className : FrameGroupPlayPagingListView.prototype.className + ' dashboard stream',

    options : _.extend({}, FrameGroupPlayPagingListView.prototype.options, {
      collectionAttribute : 'dashboard_entries',
      doCheck : SmartRefreshCheckType.headAndTail,
      doSmartRefresh : true,
      emptyIndicatorViewProto : DashboardEmptyIndicatorView,
      initFixedHead : true,
      intervalInsertViews : function() {
        //we'll just randomly choose to show a promo for the explore section or for a specific roll
        if (Math.random() < 0.5) {
          return new InStreamExplorePromoView();
        } else {
          var promoRolls =
            shelby.models.promoRollCategories.get('roll_categories').reduce(function(memo, category){
              return memo.concat(category.get('rolls').models);
            }, []);
          //only consider rolls that have all the needed attribtues to render a promo
          promoRolls = promoRolls.filter(function(roll){
            return (roll.has('id') && roll.has('display_title') && roll.has('display_thumbnail_src'));
          })
          if (promoRolls.length) {
            var rollsCollection = new Backbone.Collection();
            //select one of the promo rolls at random to display in the promo
            rollsCollection.add(promoRolls[Math.floor(Math.random() * (promoRolls.length))]);
            return new InStreamRollPromoView({model:rollsCollection});
          } else {
            return [];
          }
        }
      },
      isIntervalComplete : function(displayedItems) {
        return displayedItems != 0;
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
