libs.shelbyGT.UserPreferencesView = Support.CompositeView.extend({
  
  events: {
	  "click form.preferences .submit:not(.disabled)": 	"_submitPreferences"
  },
  
  template : function(obj){
    return JST['user-preferences'](obj);
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  },
  
  
});