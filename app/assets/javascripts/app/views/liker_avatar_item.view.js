libs.shelbyGT.LikerAvatarItemView = libs.shelbyGT.ListItemView.extend({

  options : {
    eventTrackingCategory : 'Frame' // what category events in this view will be tracked under
  },

  initialize : function(){
    this.model.bind('change:has_shelby_avatar change:personal_roll_subdomain change:user_type', this.render, this);
  },

  _cleanup : function(){
    this.model.unbind('change:has_shelby_avatar change:personal_roll_subdomain change:user_type', this.render, this);
  },

  template : function(obj){
    return SHELBYJST['liker-avatar-item'](obj);
  },

  render : function(){
    var userDesc = this.model.get('nickname');
    if (this.model.get('user_type') == libs.shelbyGT.UserModel.USER_TYPE.faux) {
      var service = this.model.get('authentications')[0].provider;
      userDesc += ' via ' + _(service).capitalize();
    }

    this.$el.html(this.template({
      user : this.model,
      userDescription : userDesc,
      eventTrackingCategory : this.options.eventTrackingCategory
    }));
    return this;
  }

});