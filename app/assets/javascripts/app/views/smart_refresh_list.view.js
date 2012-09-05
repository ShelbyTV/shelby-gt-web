libs.shelbyGT.SmartRefreshCheckType = {
  binarySearch : 'binarySearch',
  head : 'head',
  headAndTail : 'headAndTail',
  key : 'key',
  tail : 'tail'
};

libs.shelbyGT.SmartRefreshListView = libs.shelbyGT.ListView.extend({

  _fixedHeadItem : null,

  _fixedHeadIndex : 0,

  options : _.extend({}, libs.shelbyGT.ListView.prototype.options, {
    binarySearchOffset : 0,
    doCheck : libs.shelbyGT.SmartRefreshCheckType.tail,
    doSmartRefresh : false,
    initFixedHead : false,
    keyAttribute : 'id',
    sortOrder : 1, // 1 for ascending, -1 for descending
    sortAttribute : 'id'
  }),

  initialize : function() {
    libs.shelbyGT.ListView.prototype.initialize.call(this);
    if (this.options.initFixedHead) {
      this._fixedHeadItem = this._simulatedMasterCollection.first();
      this._fixedHeadIndex = 0;
    }
  },

  sourceAddOne : function(item, collection, options){
    if (this.options.doSmartRefresh) {
      // there's no way to effectively specify add:true for a Backbone Relational collection
      // we can simulate it by storing all of the contents the relational collection ever loaded,
      // and using this as a surrogate for the relational collection itself when re-filtering
      if (!this.options.collection && this.options.simulateAddTrue) {
        this._addIfNew(item, collection);
      }
    } else {
      this._addItem(item, collection, options);
    }
  },

  _addIfNew : function(item, collection) {
    switch (this.options.doCheck) {
      case libs.shelbyGT.SmartRefreshCheckType.binarySearch :
          if (this._simulatedMasterCollection.length >= this.options.binarySearchOffset) {
            var insertAtIndex =
              libs.utils.BackboneCollectionUtils.getSortedIndex(item, collection,
                                                    {searchOffset : this.options.binarySearchOffset,
                                                     sortAttribute : this.options.sortAttribute,
                                                     sortDirection : this.options.sortDirection});
            this._addItem(item, collection, {at:insertAtIndex});
          } else {
            this._addItem(item, collection);
          }
        break;
      case libs.shelbyGT.SmartRefreshCheckType.tail :
        var tailItem = this._simulatedMasterCollection.last();
        var doAddToTail = this._shouldAdd(item, tailItem);
        if (doAddToTail) {
          this._addItem(item, collection);
        }
        break;
      case libs.shelbyGT.SmartRefreshCheckType.head :
        var headItem = this.options.initFixedHead ? this._fixedHeadItem : this._simulatedMasterCollection.first();
        var doAddToHead = this._shouldAdd(item, headItem, true);
        if (doAddToHead) {
          var headAddIndex = this.options.initFixedHead ? this._fixedHeadIndex : 0;
          this._addItem(item, collection, {at:headAddIndex});
          if (this.options.initFixedHead) {
            this._updateFixedHeadIndex();
          }
        }
        break;
      case libs.shelbyGT.SmartRefreshCheckType.headAndTail :
        var compareItem = this._simulatedMasterCollection.last();
        var doAdd = this._shouldAdd(item, compareItem);
        if (doAdd) {
          this._addItem(item, collection);
          return;
        }
        compareItem = this.options.initFixedHead ? this._fixedHeadItem : this._simulatedMasterCollection.first();
        doAdd = this._shouldAdd(item, compareItem, true);
        if (doAdd) {
          var addIndex = this.options.initFixedHead ? this._fixedHeadIndex : 0;
          this._addItem(item, collection, {at:addIndex});
          if (this.options.initFixedHead) {
            this._updateFixedHeadIndex();
          }
        }
        break;
      case libs.shelbyGT.SmartRefreshCheckType.key :
        var self = this;
        var existingItem = this._simulatedMasterCollection.find(function(compareItem) {
          return compareItem.get(self.options.keyAttribute) == item.get(self.options.keyAttribute);
        });
        if (!existingItem) {
          this._addItem(item, collection);
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

  _addItem : function(item, collection, options) {
    if (this.options.doSmartRefresh) {
      this._simulatedMasterCollection.add(item, options);
      if (!this._filter || this._filter(item)) {
        if (this.options.doCheck == libs.shelbyGT.SmartRefreshCheckType.binarySearch) {
          libs.utils.BackboneCollectionUtils.insertAtSortedIndex(item, this._displayCollection,
                                                {searchOffset : this.options.binarySearchOffset,
                                                 sortAttribute : this.options.sortAttribute,
                                                 sortDirection : this.options.sortDirection});
        } else {
          this._displayCollection.add(item, options);
        }
      }
    } else {
      libs.shelbyGT.ListView.prototype.sourceAddOne.call(this, item, collection, options);
    }
  },

  _updateFixedHeadIndex : function() {
    this._fixedHeadIndex = this._simulatedMasterCollection.indexOf(this._fixedHeadItem);
  }

});