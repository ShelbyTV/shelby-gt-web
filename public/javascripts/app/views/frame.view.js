FrameView = ListItemView.extend({

  tagName : 'li',

  className : 'frame',

  template : function(obj){
    return JST['frame'](obj);
  },

  initialize : function(){
    this.model.bind('change', this.render, this);
    this.model.bind('destroy', this.remove, this);
  },

  render : function(){
    this.$el.html(this.template({frame : this.model.toJSON()}));
  }

});
