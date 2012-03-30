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
    this.renderChild(new libs.shelbyGT.RollHeaderView({model:this.model}));
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

});
