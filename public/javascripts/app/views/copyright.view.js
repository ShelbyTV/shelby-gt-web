libs.shelbyGT.CopyrightView = Support.CompositeView.extend({
  
  template : function(obj){
    return JST['copyright'](obj);
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  }

});