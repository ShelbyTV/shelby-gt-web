libs.shelbyGT.SmartRefreshListView = libs.shelbyGT.ListView.extend({

  options : _.extend({}, libs.shelbyGT.ListView.prototype.options, {
    doCheckHead : false,
    doCheckTail : true,
    doSmartRefresh : false,
    sortOrder : 1,
    sortAttribute : 'id'
  }),

  sourceAddOne : function(item){
    if (this.options.doSmartRefresh) {
      // there's no way to effectively specify add:true for a Backbone Relational collection
      // we can simulate it by storing all of the contents the relational collection ever loaded,
      // and using this as a surrogate for the relational collection itself when re-filtering
      if (!this.options.collection && this.options.simulateAddTrue) {
        this._addIfNew(item);
      }
    } else {
      this._addItem(item);
    }
  },

  _addIfNew : function(item) {
    if (this.options.doCheckTail) {
      var tailItem = this._simulatedMasterCollection.last();
      var doAddToTail = this._shouldAdd(item, tailItem);
      if (doAddToTail) {
        this._addItem(item);
        return;
      }
    }
    if (this.options.doCheckHead) {
      var headItem = this._simulatedMasterCollection.first();
      var doAddToHead = this._shouldAdd(item, headItem, true);
      if (doAddToHead) {
        this._addItem(item, {at:0});
      }
    }

  },

  _shouldAdd : function(item, compareItem, toHead) {
      var doAdd = true;

      if (compareItem) {
        doAdd = false;
        var thisItemSortValue = item.get(this.options.sortAttribute);
        var compareItemSortValue = compareItem.get(this.options.sortAttribute);
        var thisItemFollows = thisItemSortValue > compareItemSortValue;
        var thisItemPrecedes = thisItemSortValue < compareItemSortValue;
        if ((this.options.sortOrder == 1 && (toHead ? thisItemPrecedes : thisItemFollows)) ||
            (this.options.sortOrder == -1 && (toHead ? thisItemFollows : thisItemPrecedes))) {
          doAdd = true;
        }
      }

      return doAdd;
  },

  _addItem : function(item, options) {
    if (this.options.doSmartRefresh) {
      this._simulatedMasterCollection.add(item, options);
      if (!this._filter || this._filter(item)) {
        this._displayCollection.add(item, options);
      }
    } else {
      libs.shelbyGT.ListView.prototype.sourceAddOne.call(this, item);
    }
  }

});