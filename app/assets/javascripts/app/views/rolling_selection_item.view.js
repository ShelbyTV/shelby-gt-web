libs.shelbyGT.RollingSelectionItemView = libs.shelbyGT.ListItemView.extend({

  events : {
    "click" : "_selectRoll"
  },

  className : 'rolling__roll-selection-item clearfix',

  template : function(obj){
    return SHELBYJST['roll-selection-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({roll : this.model}));
  },

  _selectRoll : function(e){
    e.preventDefault();
    this.parent.selectRoll(this.model);
  }

});