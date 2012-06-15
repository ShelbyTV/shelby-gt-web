libs.shelbyGT.RollingSelectionItemView = libs.shelbyGT.ListItemView.extend({

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

  _reRollToThis : function(e){
    e.preventDefault();
    this.parent.rollToExisting(this.options.frame, this.model);
  }

});