libs.shelbyGT.UserPreferencesView = Support.CompositeView.extend({

  template : function(obj){
    return JST['user-preferences'](obj);
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  }

});