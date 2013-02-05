libs.shelbyGT.LikerAvatarItemView = libs.shelbyGT.ListItemView.extend({

  template : function(obj){
    return SHELBYJST['liker-avatar-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({user : this.model}));
    return this;
  }
});