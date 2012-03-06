FrameView = Backbone.View.Extend({

  tagName : 'li',

  className : 'frame',

  template : JST['frame'],

  initialize : function(){
    this.model.bind('change', this.render, this);
    this.model.bind('destroy', this.remove, this);
  },

  render : function(){
    $(this.el).html(this.template({frame : this.model.toJSON()}));
  }

});
