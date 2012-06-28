libs.utils.BackboneCollectionUtils = {
  insertAtSortedIndex : function(model, collection, options){
    var insertAtIndex = libs.utils.BackboneCollectionUtils.getSortedIndex(model, collection, options);
    collection.add(model, {at:insertAtIndex});
  },

  getSortedIndex : function(model, collection, options){
    // default options
    options = _.chain({}).extend(options).defaults({
      searchOffset : 0,
      sortAttribute : 'id'
    }).value();

    var rankingFunc = function(item){return item.get(options.sortAttribute);};
    return collection.chain().rest(options.searchOffset).sortedIndex(model, rankingFunc).value() + options.searchOffset;
  }
};
