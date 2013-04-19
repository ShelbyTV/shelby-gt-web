libs.shelbyGT.ActorAvatarItemView = libs.shelbyGT.ListItemView.extend({

  options : {
    eventTrackingCategory : 'Frame', // what category events in this view will be tracked under
    actorDescription : 'liker' // what type of actor (ie what did they do to this frame) is this? (so far used only for event tracking)
  },

  events : {
    "click .js-actor-avatar-link" : "_goToActorPersonalRoll"
  },

  initialize : function(){
    this.model.bind('change:has_shelby_avatar change:personal_roll_subdomain change:user_type', this.render, this);
  },

  _cleanup : function(){
    this.model.unbind('change:has_shelby_avatar change:personal_roll_subdomain change:user_type', this.render, this);
  },

  template : function(obj){
    return SHELBYJST['actor-avatar-item'](obj);
  },

  render : function(){
    var userDesc = this.model.get('nickname');
    if (this.model.get('user_type') == libs.shelbyGT.UserModel.USER_TYPE.faux) {
      var service = this.model.get('authentications')[0].provider;
      userDesc += ' via ' + _(service).capitalize();
    }

    this.$el.html(this.template({
      actorDescription : this.options.actorDescription,
      user : this.model,
      userDescription : userDesc,
      eventTrackingCategory : this.options.eventTrackingCategory
    }));
    return this;
  },

  _goToActorPersonalRoll : function(e) {
      shelby.router.navigate('user/' + this.model.id + '/personal_roll', {trigger:true});
      e.preventDefault();
  }

});