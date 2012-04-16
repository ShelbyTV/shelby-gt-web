( function(){

  // shorten names of included library prototypes
  var AutoScrollFrameListView = libs.shelbyGT.AutoScrollFrameListView;

  libs.shelbyGT.DashboardView = AutoScrollFrameListView.extend({

    className : AutoScrollFrameListView.prototype.className + ' dashboard',

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
        collectionAttribute : 'dashboard_entries',
        listItemView : function(item){
          var mapResult = self.actionToViewMap[item.get('action')];
          return new mapResult.view({model:item.get(mapResult.model_attr)});
        },
        fetchParams : {
          include_children : true
        }
      });
      AutoScrollFrameListView.prototype.initialize.call(this);
    },

    filter : function(item){
      return item.get('frame');
    }

  });

} ) ();
