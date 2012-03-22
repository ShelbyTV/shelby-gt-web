libs.shelbyGT.RollListView = ListView.extend({

  className : ListView.prototype.className + ' roll-list',

  initialize : function(){
    this.options.collectionAttribute = 'rolls_followings';
    this.options.listItemView = 'RollItemView';
    ListView.prototype.initialize.call(this);
  }

});
