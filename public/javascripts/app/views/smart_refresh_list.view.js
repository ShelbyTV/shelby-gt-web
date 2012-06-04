libs.shelbyGT.SmartRefreshListView = libs.shelbyGT.ListView.extend({

  className : /*libs.shelbyGT.ListView.prototype.className +*/ 'rolls-list js-rolls-list',

  options : _.extend({}, libs.shelbyGT.ListView.prototype.options, {
    doSmartRefresh : false
  }),

  sourceAddOne : function(item){
    if (this.options.doSmartRefresh) {
      // there's no way to effectively specify add:true for a Backbone Relational collection
      // we can simulate it by storing all of the contents the relational collection ever loaded,
      // and using this as a surrogate for the relational collection itself when re-filtering
      if (!this.options.collection && this.options.simulateAddTrue) {
        if (this.shouldAdd(item))
          this._simulatedMasterCollection.add(item);
        if (!this._filter || this._filter(item)) {
          this._displayCollection.add(item);
        }
      }
    } else {
      libs.shelbyGT.ListView.prototype.sourceAddOne.call(this, item);
    }
  },

  shouldAdd : function(item) {
    var latestItem = this._simulatedMasterCollection.last();
    return latestItem ? item.id > latestItem.id : true;
  }

});