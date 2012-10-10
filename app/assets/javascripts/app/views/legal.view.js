libs.shelbyGT.LegalView = Support.CompositeView.extend({
  
  template : function(obj){
    return SHELBYJST['legal'](obj);
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  }

});