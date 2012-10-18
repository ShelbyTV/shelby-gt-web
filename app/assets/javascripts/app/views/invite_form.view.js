libs.shelbyGT.InviteFormView = Support.CompositeBehaviorView.extend({

  template : function(obj){
      return SHELBYJST['invite-form'](obj);
  },

  render : function(){
    this.$el.html(this.template());
  }

});
