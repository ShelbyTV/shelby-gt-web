( function(){

  // shorten names of included library prototypes
  var AutoScrollFrameListView = libs.shelbyGT.AutoScrollFrameListView;

  libs.shelbyGT.DashboardView = AutoScrollFrameListView.extend({

    className : AutoScrollFrameListView.prototype.className + ' dashboard',

    options : _.extend({}, AutoScrollFrameListView.prototype.options, {
      collectionAttribute : 'dashboard_entries',
      doCheckHead : true,
      doSmartRefresh : true,
      fetchParams : {
        include_children : true
      },
      sortOrder : -1
    }),

    actionToViewMap : {
      '0' : {view: libs.shelbyGT.FrameView, model_attr:'frame'},
      '1' : {view: libs.shelbyGT.FrameView, model_attr:'frame'},
      '2' : {view: libs.shelbyGT.FrameView, model_attr:'frame'},
      '8' : {view: libs.shelbyGT.FrameView, model_attr:'frame'},
      '9' : {view: libs.shelbyGT.FrameView, model_attr:'frame'},
      '10' : {view: libs.shelbyGT.FrameView, model_attr:'frame'}
    },

    initialize : function(){
      var self = this;
      _(this.options).extend({
        listItemView : function(item, params){
          var mapResult = self.actionToViewMap[item.get('action')];
          return new mapResult.view(_(params).extend({model:item.get(mapResult.model_attr)}));
        }
      });
      shelby.models.guide.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      this._initInfiniteScrolling();
      AutoScrollFrameListView.prototype.initialize.call(this);
    },

    _cleanup : function(){
      shelby.models.guide.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      AutoScrollFrameListView.prototype._cleanup.call(this);
    },

    _onActiveFrameModelChange : function(guideModel, activeFrameModel){
      // when the active frame model changes, find the dashboard entry that contains that frame
      // and store that information
      if (activeFrameModel) {
        var entry = this.model.get('dashboard_entries').find(function(entry){
          return entry.get('frame') == activeFrameModel;
        });
        if (entry) {
          shelby.models.guide.set('activeDashboardEntryModel', entry);
        }
      }
    },

    _filter : function(item){
      return item.get('frame');
    },

    _doesResponseContainListCollection : function(response) {
      return $.isArray(response.result);
    }

  });

} ) ();
