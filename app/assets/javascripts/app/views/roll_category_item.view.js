libs.shelbyGT.RollCategoryItemView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  events : {
    "click" : "_setDisplayedCategory"
  },

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'displayedRollCategory',
      activeClassName : 'active-list-item'
  }),

  className : 'list_item guide-item',

  template : function(obj){
    return SHELBYJST['roll-category-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({rollCategory : this.model}));
    return libs.shelbyGT.ActiveHighlightListItemView.prototype.render.call(this);
  },

  _setDisplayedCategory : function() {
    this.options.exploreGuideModel.set('displayedRollCategory', this.model);
  },

  // override ActiveHighlightListItemView abstract method
  doActivateThisItem : function(exploreGuideModel){
    var displayedRollCategory = exploreGuideModel.get('displayedRollCategory');
    if (displayedRollCategory && displayedRollCategory == this.model) {
      return true;
    } else {
      return false;
    }
  }

});