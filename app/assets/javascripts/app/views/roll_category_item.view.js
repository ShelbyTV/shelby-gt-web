libs.shelbyGT.RollCategoryItemView = libs.shelbyGT.ListItemView.extend({

  className : 'list_item guide-item',

  template : function(obj){
    return JST['roll-category-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({rollCategory : this.model}));
    return this;
  }

});