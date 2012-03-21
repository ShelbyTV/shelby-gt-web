libs.shelbyGT.GuideHeaderView = Backbone.View.extend({

  /*events : {
    "click .roll" : "goToRoll"
  },

  tagName : 'li',

  className : 'frame',*/

  el : '#header',

  template : function(obj){
    return JST['guide-header'](obj);
  },

  initialize : function(){
    /*this.model.bind('change', this.render, this);
    this.model.bind('destroy', this.remove, this);
    shelby.models.guide.bind('change:activeFrameModel', this._onNewActiveFrame, this);*/
    this.render();
  },

  render : function(active){
    //this.$el.html(this.template({frame : this.model.toJSON(), active : active}));
    this.$el.html(this.template());
  }

  /*_cleanup : function(){
    this.model.unbind('change', this.render, this);
    this.model.unbind('destroy', this.remove, this);
    shelby.models.guide.unbind('change:activeFrameId', this._onNewActiveFrame, this);
  }*/

});
