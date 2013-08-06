libs.shelbyGT.OnboardingInviteFriendItemView = libs.shelbyGT.ListItemView.extend({

  events : {
    "click .js-onboarding-roll-button:not(.js-busy)" : "_inviteFriend",
  },

  template : function(obj) {
        return SHELBYJST['onboarding/onboarding-invite-friend-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({
      roll : this.model
    }));
  },

  _inviteFriend : function(e) {
    var self = this;

    if (typeof FB != "undefined"){
      var $thisButton = $(e.currentTarget).toggleClass('button_busy js-busy button_enabled visuallydisabled');
      FB.ui(
        {
          description : "Shelby.tv is a single stream of video, personalized to you that gets better over time.", //message
          link        : 'http://shelby.tv/signup?code=' + shelby.models.user.id,
          method      : 'send',
          name        : "You've been invited to join Shelby.tv", //header
          picture     : 'http://shelby.tv/images/mark_144sq.png',
          to          : _(this.model.get('creator_authentications')).find(function(a){ return a.provider == 'facebook'; }).uid
        },
        function(response) {
          if (response) {
            if (response.success) {
              var viewModel = self.options.onboardingConnectServicesViewModel;
              viewModel.set('numInvitesSent', viewModel.get('numInvitesSent') + 1);

              $thisButton.removeClass('button_busy').children('.button_label').text('Invited');
              return;
            }
          }
          // if we didn't successfully invite the person, make the invite button usable again
          $thisButton.toggleClass('button_busy js-busy button_enabled visuallydisabled');
        }
      );
    }
  }
});