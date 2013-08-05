libs.shelbyGT.OnboardingInviteFriendItemView = libs.shelbyGT.ListItemView.extend({
  template : function(obj) {
        return SHELBYJST['onboarding/onboarding-invite-friend-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({
      roll : this.model
    }));
  }
});