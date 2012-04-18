( function(){

  // shorten names of included library prototypes
  var AutoScrollFrameListView = libs.shelbyGT.AutoScrollFrameListView;

  libs.shelbyGT.DashboardView = AutoScrollFrameListView.extend({

    className : AutoScrollFrameListView.prototype.className + ' dashboard',

    options : _.extend({}, AutoScrollFrameListView.prototype.options, {
      collectionAttribute : 'dashboard_entries',
      fetchParams : {
        include_children : true
      }
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
        listItemView : function(item){
          var mapResult = self.actionToViewMap[item.get('action')];
          return new mapResult.view({model:item.get(mapResult.model_attr)});
        }
      });
      AutoScrollFrameListView.prototype.initialize.call(this);
    },

    filter : function(item){
      return item.get('frame');
    },

    _doesResponseContainListCollection : function(response) {
      return $.isArray(response.result);
    }

  });

} ) ();
