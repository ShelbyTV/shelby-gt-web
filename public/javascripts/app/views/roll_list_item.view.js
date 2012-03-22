libs.shelbyGT.RollItemView = ListItemView.extend({

  /*events : {
    "click .roll-item" : "goToRoll"
  },*/

  tagName : 'li',

  className : 'roll-item',

  template : function(obj){
    return JST['roll-item'](obj);
  },

  initialize : function(){
    this.model.bind('change', this.render, this);
    this.model.bind('destroy', this.remove, this);
  },

  render : function(){
    this.$el.html(this.template({roll : this.model}));
  },

  goToRoll : function(){
    shelby.router.navigateToRoll(this.model.get('roll'), {trigger:true});
  },

  _cleanup : function(){
    this.model.unbind('change', this.render, this);
    this.model.unbind('destroy', this.remove, this);
  }

});
