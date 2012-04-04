libs.shelbyGT.RollSelectionItemView = ListItemView.extend({

  events : {
    "click" : "_reRollToThis"
  },

  tagName : 'li',

  className : 'roll-selection-item clearfix',

  template : function(obj){
    return JST['roll-selection-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({roll : this.model}));
  },

  _reRollToThis : function(){
    this.options.frame.reRoll(this.model, function(){
      console.log('rolling successful');
    });
  }

});
