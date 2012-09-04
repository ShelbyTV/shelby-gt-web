libs.shelbyGT.ListItemView = Support.CompositeView.extend({

  tagName : 'li',

  isMyModel : function(model) {
    return this.model.id == model.id;
  }

});
