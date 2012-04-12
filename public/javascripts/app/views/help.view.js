libs.shelbyGT.HelpView = Support.CompositeView.extend({
  
  template : function(obj){
    return JST['help'](obj);
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  }

});