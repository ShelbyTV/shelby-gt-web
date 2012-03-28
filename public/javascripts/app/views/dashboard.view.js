( function(){

  // shorten names of included library prototypes
  var AutoScrollFrameListView = libs.shelbyGT.AutoScrollFrameListView;

  libs.shelbyGT.DashboardView = AutoScrollFrameListView.extend({

    className : AutoScrollFrameListView.prototype.className + ' dashboard',

    actionToViewMap : {
      '0' : {view: libs.shelbyGT.FrameView, model_attr:'frame'},
      '1' : {view: libs.shelbyGT.FrameView, model_attr:'frame'},
      '8' : {view: libs.shelbyGT.RerollEntryView, model_attr:'frame'},
      '9' : {view: libs.shelbyGT.FrameView, model_attr:'frame'},
      '10' : {view: libs.shelbyGT.FrameView, model_attr:'frame'}
    },

    initialize : function(){
      var self = this;
      this.options.collectionAttribute = 'dashboard_entries';
      this.options.listItemView = function(item){
        var mapResult = self.actionToViewMap[item.get('action')];
        return new mapResult.view({model:item.get(mapResult.model_attr)});
      };
      AutoScrollFrameListView.prototype.initialize.call(this);
    }

  });

} ) ();