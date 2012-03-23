libs.shelbyGT.RollListView = ListView.extend({

  className : ListView.prototype.className + ' roll-list',

  initialize : function(){
    this.options.collectionAttribute = 'roll_followings';
    this.options.listItemView = 'RollItemView';
    ListView.prototype.initialize.call(this);
  }

});
