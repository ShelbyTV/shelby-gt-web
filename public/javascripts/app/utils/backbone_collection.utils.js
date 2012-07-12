libs.utils.BackboneCollectionUtils = {
  insertAtSortedIndex : function(model, collection, options){
    var insertAtIndex = libs.utils.BackboneCollectionUtils.getSortedIndex(model, collection, options);
    collection.add(model, {at:insertAtIndex});
  },

  getSortedIndex : function(model, collection, options){
    // default options
    options = _.chain({}).extend(options).defaults({
      searchOffset : 0,
      sortAttribute : 'id',
      sortDirection : 'asc'
    }).value();

    var rankingFunc = function(item){return item.get(options.sortAttribute);};

    if(options.sortDirection === "desc"){
      var collectionToInspect = collection.chain().rest(options.searchOffset).reverse();
      return (collectionToInspect.value().length - collectionToInspect.sortedIndex(model, rankingFunc).value()) + options.searchOffset;
    } else {
      var collectionToInspect = collection.chain().rest(options.searchOffset);
      return collectionToInspect.sortedIndex(model, rankingFunc).value() + options.searchOffset;
    }
  }
};
