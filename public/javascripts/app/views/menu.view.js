libs.shelbyGT.MenuView = Support.CompositeView.extend({

  events : {
    "click .stream" : "goToStream",
    "click .rolls" : "goToRolls",
    "click .saves" : "goToSaves"
  },

  el : '.menu',

  template : function(obj){
    return JST['menu'](obj);
  },

  initialize : function(){
    this.render();
  },

  render : function(active){
    this.$el.html(this.template());
  },

  goToStream : function(){
    shelby.router.navigate('/', {trigger:true});
  },

  goToRolls : function(){
    shelby.router.navigate('/rolls', {trigger:true});
  },

  goToSaves : function(){
    shelby.router.navigate('/saves', {trigger:true});
  }

  /*_cleanup : function(){
    this.model.unbind('change', this.render, this);
    this.model.unbind('destroy', this.remove, this);
    shelby.models.guide.unbind('change:activeFrameId', this._onNewActiveFrame, this);
  }*/

});
