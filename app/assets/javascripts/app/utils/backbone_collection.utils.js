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

    var rankingFunc = function(item){
      if (item.constructor != libs.shelbyGT.FrameGroupModel) {
        return item.get(options.sortAttribute);
      } else {
        var primaryDashboardEntry = item.get('primaryDashboardEntry');
        return (primaryDashboardEntry && primaryDashboardEntry.get(options.sortAttribute)) || item.getFirstFrame().get(options.sortAttribute);
      }
    };

    var collectionToInspect;
    if(options.sortDirection === "desc"){
      collectionToInspect = collection.chain().rest(options.searchOffset).reverse();
      return (collectionToInspect.value().length - collectionToInspect.sortedIndex(model, rankingFunc).value()) + options.searchOffset;
    } else {
      collectionToInspect = collection.chain().rest(options.searchOffset);
      return collectionToInspect.sortedIndex(model, rankingFunc).value() + options.searchOffset;
    }
  }
};
