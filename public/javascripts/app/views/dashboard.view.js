DashboardView = ListView.extend({

  className : ListView.prototype.className + ' dashboard',

  actionToViewMap : {
    '0' : {view: FrameView, model_attr:'frame'},
    '1' : {view: FrameView, model_attr:'frame'},
    '8' : {view: FrameView, model_attr:'frame'},
    '9' : {view: FrameView, model_attr:'frame'},
    '10' : {view: FrameView, model_attr:'frame'}
  },

  initialize : function(){
    var self = this;
    this.options.collectionAttribute = 'dashboard_entries';
    this.options.listItemView = function(item){
      var mapResult = self.actionToViewMap[item.get('action')];
      return new mapResult.view({model:item.get(mapResult.model_attr)});
    };
    ListView.prototype.initialize.call(this);
  }

});
