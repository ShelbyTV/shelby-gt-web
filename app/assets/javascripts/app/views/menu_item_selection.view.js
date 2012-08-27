libs.shelbyGT.MenuItemSelectionView = Support.CompositeBehaviorView.extend({

  options : {
    menuItemsSelector : 'li',
    selectedClass     : 'selected'
  },

  events : function() {
    var events = {};
    events["click " + this.options.menuItemsSelector + ":not(." + this.options.selectedClass + ")"] = "_setSelected";
    return events;
  },

  _setSelected : function(e){
      this._clearSelected();
      $(e.currentTarget).addClass(this.options.selectedClass);
    },

  _clearSelected : function(){
    this.$(this.options.menuItemsSelector).removeClass(this.options.selectedClass);
  }
});