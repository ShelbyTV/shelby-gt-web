libs.shelbyGT.ExploreLayoutView = Support.CompositeView.extend({

  el: '.js-explore-layout',

  template : function(obj){
      return JST['explore-layout'](obj);
  },

  render : function(){
    this.$el.html(this.template());
    this.renderChild(new libs.shelbyGT.SmartRefreshListView({
      collectionAttribute : 'roll_categories',
      doCheck : libs.shelbyGT.SmartRefreshCheckType.key,
      doSmartRefresh : true,
      el : '.js-roll-category-list',
      keyAttribute : 'category',
      listItemViewAdditionalParams : {
        activationStateModel : shelby.models.exploreGuide,
        exploreGuideModel : shelby.models.exploreGuide
      },
      listItemView : 'RollCategoryItemView',
      model : shelby.models.exploreRollCategories
    }));
    this.renderChild(new libs.shelbyGT.ExploreContentPaneView({model:shelby.models.exploreGuide}));
  }

});