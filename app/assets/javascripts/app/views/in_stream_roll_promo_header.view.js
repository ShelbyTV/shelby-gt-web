libs.shelbyGT.InStreamRollPromoHeaderView = Support.CompositeView.extend({

  tagName : 'li',

  template : function(obj){
    return JST['in-stream-roll-promo-header'](obj);
  },

  render : function(){
    this.$el.html(this.template({}));
  }

});