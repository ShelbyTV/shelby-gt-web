libs.shelbyGT.InviteFriendItemView = libs.shelbyGT.ListItemView.extend({

  events : {
    "click .js-invite-friend:not(.js-busy)" : "_inviteFriend",
    "click .js-navigate-roll" : "_navigateRoll"
  },

  template : function(obj) {
        return SHELBYJST['invite-friend-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({
      roll          : this.model
    }));
  },

  _inviteFriend : function(e) {
    var self = this;

    if (typeof FB != "undefined"){
      var $thisButton = $(e.currentTarget).toggleClass('button_busy js-busy button_enabled visuallydisabled');
      FB.ui(
        {
          link        : 'http://shelby.tv/signup/' + shelby.models.user.id,
          method      : 'send',
          to          : _(this.model.get('creator_authentications')).find(function(a){ return a.provider == 'facebook'; }).uid
        },
        function(response) {
          // if we didn't successfully invite the person, make the invite button usable again
          $thisButton.toggleClass('button_busy js-busy button_enabled visuallydisabled');
        }
      );
    }
  },

  _navigateRoll : function(e) {
    e.preventDefault();
    var id = $(e.currentTarget).data('roll_id');
    shelby.router.navigate('/roll/'+ id,{trigger:true,replace:false});
  }

});
