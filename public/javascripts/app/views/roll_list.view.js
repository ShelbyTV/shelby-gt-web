libs.shelbyGT.RollListView = libs.shelbyGT.ListView.extend({

  className : /*libs.shelbyGT.ListView.prototype.className +*/ 'rolls-list js-rolls-list',

  options : _.extend({}, libs.shelbyGT.ListView.prototype.options, {
    collectionAttribute : 'roll_followings',
    listItemView : 'RollItemView'
  })

});