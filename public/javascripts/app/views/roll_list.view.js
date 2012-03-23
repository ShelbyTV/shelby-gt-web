libs.shelbyGT.RollListView = libs.shelbyGT.ListView.extend({

  className : libs.shelbyGT.ListView.prototype.className + ' roll-list',

  initialize : function(){
    this.options.collectionAttribute = 'roll_followings';
    this.options.listItemView = 'RollItemView';
    libs.shelbyGT.ListView.prototype.initialize.call(this);
  }

});
