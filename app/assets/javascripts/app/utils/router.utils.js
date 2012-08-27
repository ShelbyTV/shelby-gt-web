libs.shelbyGT.RouterUtils = {
  fetchRollCategoriesAndCheckAutoSelect : function() {
    return shelby.models.exploreRollCategories.fetch({
      success: function(rollCategoriesCollectionModel, response){
        // if no roll category is already selected, automatically select the first category in the list
        if (!shelby.models.exploreGuide.has('displayedRollCategory')) {
          var firstRollCateogry = rollCategoriesCollectionModel.get('roll_categories').at(0);
          if (firstRollCateogry) {
            shelby.models.exploreGuide.set('displayedRollCategory', firstRollCateogry);
          }
        }
      }
    });
  }
};
