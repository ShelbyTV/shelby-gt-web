libs.shelbyGT.UserProfileInfoView = Support.CompositeView.extend({

  events: {
  },

  template : function(obj){
    return SHELBYJST['user-profile-info'](obj);
  },

  initialize : function(){
    this.model.bind('change', this.render, this);
  },

  _cleanup : function(){
   this.model.unbind('change', this.render, this);
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  }

});