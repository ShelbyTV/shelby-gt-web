libs.shelbyGT.TeamView = Support.CompositeView.extend({
  
  template : function(obj){
    return JST['team'](obj);
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  }

});