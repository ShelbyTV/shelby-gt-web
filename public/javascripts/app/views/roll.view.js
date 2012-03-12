RollView = ListView.extend({

  initialize : function(){
    this.options.collectionAttribute = 'frames';
    this.options.listItemView = 'FrameView';
    ListView.prototype.initialize.call(this);
  }

});
