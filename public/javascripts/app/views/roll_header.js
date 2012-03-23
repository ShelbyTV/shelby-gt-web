libs.shelbyGT.RollHeaderView = Support.CompositeView.extend({

  /*events : {
    "click .about" : "showAboutSubnav",
    "click .profile" : "showProfileSubnav"
  },*/

  el : '#roll-header',

  template : function(obj){
    return JST['roll-header'](obj);
  },

  initialize : function(){
    this.render();
  },

  render : function(){
    this.$el.html(this.template());
  },

  /*_cleanup : function(){
    this.model.unbind('change', this.render, this);
    this.model.unbind('destroy', this.remove, this);
    shelby.models.guide.unbind('change:activeFrameId', this._onNewActiveFrame, this);
  }*/

});
