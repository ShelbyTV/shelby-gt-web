libs.shelbyGT.SmartRefreshCheckType = {
  head : 'head',
  headAndTail : 'headAndTail',
  tail : 'tail'
};

libs.shelbyGT.SmartRefreshListView = libs.shelbyGT.ListView.extend({

  _fixedHeadItem : null,

  options : _.extend({}, libs.shelbyGT.ListView.prototype.options, {
    doCheck : libs.shelbyGT.SmartRefreshCheckType.tail,
    doSmartRefresh : false,
    initFixedHead : false,
    sortOrder : 1,
    sortAttribute : 'id'
  }),

  initialize : function() {
    libs.shelbyGT.ListView.prototype.initialize.call(this);
    if (this.options.initFixedHead) {
      this._fixedHeadItem = this._simulatedMasterCollection.first();
    }
  },

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
    switch (this.options.doCheck) {
      case libs.shelbyGT.SmartRefreshCheckType.tail :
        var tailItem = this._simulatedMasterCollection.last();
        var doAddToTail = this._shouldAdd(item, tailItem);
        if (doAddToTail) {
          this._addItem(item);
        }
        break;
      case libs.shelbyGT.SmartRefreshCheckType.head :
        var headItem = this.options.initFixedHead ? this._fixedHeadItem : this._simulatedMasterCollection.first();
        var doAddToHead = this._shouldAdd(item, headItem, true);
        if (doAddToHead) {
          this._addItem(item, {at:0});
        }
        break;
      case libs.shelbyGT.SmartRefreshCheckType.headAndTail :
        var compareItem = this._simulatedMasterCollection.last();
        var doAdd = this._shouldAdd(item, compareItem);
        if (doAdd) {
          this._addItem(item);
          return;
        }
        compareItem = this.options.initFixedHead ? this._fixedHeadItem : this._simulatedMasterCollection.first();
        doAdd = this._shouldAdd(item, compareItem, true);
        if (doAdd) {
          this._addItem(item, {at:0});
        }
        break;
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