libs.shelbyGT.ShareRollView = Support.CompositeView.extend({

  el : '#js-share-roll',

  template : function(obj){
    return JST['share-roll'](obj);
  },

  render : function(){
    this.$el.html(this.template());
  }

});
