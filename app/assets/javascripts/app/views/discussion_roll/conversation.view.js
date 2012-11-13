/*
 * Displays the meat of this discussion roll: the actual messages and videos.
 *
 * Since a discussion roll is just a Roll, our view is just an adjusted Roll view....
 *    All of the messages in the conversation are shown
 *    The newest message is at the bottom
 *    There is a "reply" view displayed below this
 *    Most regular shelby actions are not shown
 */
libs.shelbyGT.DiscussionRollConversationView = Support.CompositeView.extend({
  
  el: '.js-discussion-roll-conversation',
  
  initialize : function(){
    this.render();
  },
  
  template : function(obj){
    return SHELBYJST['discussion-roll/conversation'](obj);
  },
  
  render : function(){
    this.$el.html(this.template());
    
    /* AN EXAMPLE, FOR REFERENCE:
    this.$el.html(this.template());
    this.renderChild(new libs.shelbyGT.SmartRefreshListView({
      collectionAttribute : 'roll_categories',
      doCheck : libs.shelbyGT.SmartRefreshCheckType.key,
      doSmartRefresh : true,
      el : '.js-roll-category-list',
      keyAttribute : 'category_title',
      listItemViewAdditionalParams : {
        activationStateModel : shelby.models.exploreGuide,
        exploreGuideModel : shelby.models.exploreGuide
      },
      listItemView : 'RollCategoryItemView',
      model : shelby.models.exploreRollCategories
    }));
    this.renderChild(new libs.shelbyGT.ExploreContentPaneView({model:shelby.models.exploreGuide}));
    this._spinnerState = new libs.shelbyGT.SpinnerStateModel();
    this._spinnerView = new libs.shelbyGT.SpinnerView({
      model : this._spinnerState,
      el : '.js-guide-explore',
      size : 'large-light'
    });
    this.renderChild(this._spinnerView);
    */
  }
  
});