libs.shelbyGT.RollView = ListView.extend({

  className : ListView.prototype.className + ' roll',

  initialize : function(){
    this.options.collectionAttribute = 'frames';
    this.options.listItemView = 'FrameView';
    ListView.prototype.initialize.call(this);
  }

});
