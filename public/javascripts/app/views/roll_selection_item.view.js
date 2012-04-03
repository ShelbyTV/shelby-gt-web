libs.shelbyGT.RollSelectionItemView = ListItemView.extend({

  events : {
    "click" : "_rollTo"
  },

  tagName : 'li',

  className : 'roll-selection-item clearfix',

  template : function(obj){
    return JST['roll-selection-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({roll : this.model}));
  },

  _rollTo : function(){
    console.log('Roll',this.model,'frame',this.options.frame);
  }

});
