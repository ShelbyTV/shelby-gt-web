libs.shelbyGT.RerollEntryView = ListItemView.extend({

  tagName : 'li',

  className : 'reroll',

  // template : function(obj){
  //   return JST['frame'](obj);
  // },

  render : function(){
    this.$el.html('reroll');
  }

});
