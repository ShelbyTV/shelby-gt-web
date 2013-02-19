libs.shelbyGT.LikerAvatarItemView = libs.shelbyGT.ListItemView.extend({

  initialize : function(){
    this.model.bind('change:has_shelby_avatar', this.render, this);
    this.model.bind('change:personal_roll_subdomain', this.render, this);
  },

  _cleanup : function(){
    this.model.unbind('change:has_shelby_avatar', this.render, this);
    this.model.unbind('change:personal_roll_subdomain', this.render, this);
  },

  template : function(obj){
    return SHELBYJST['liker-avatar-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({user : this.model}));
    return this;
  }

});