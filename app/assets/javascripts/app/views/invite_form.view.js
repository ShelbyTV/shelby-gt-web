libs.shelbyGT.InviteFormView = Support.CompositeBehaviorView.extend({

  events: {
    "click .js-send-invite" : "_sendInvite",
    "mouseleave" : "_onMouseLeave"
  },

  template : function(obj){
      return SHELBYJST['invite-form'](obj);
  },

  render : function(){
    this.$el.html(this.template({
      invite : this.model,
      user : this.options.user
    }));
    var recipientsAutocompleteView = new libs.shelbyGT.EmailAddressAutocompleteView({
      el : this.$('.js-invite-email')[0],
      includeSources : ['email']
    });
    this.renderChild(recipientsAutocompleteView);
  },

  _sendInvite : function(){

    var self = this;

    //hold the dropdown open until the ajax has finshed and we've given the user feedback on their action
    this.$el.addClass('dropdown_module--stay-open');

    this.model.save({
      to : this.$('.js-invite-email').val(),
      body : this.$('.js-invite-message').val()
    },{
      success : function(){
        //show some feedback on the invite being successfully sent
        self.$('.js-invite-form').html(SHELBYJST['invite-form-feedback']);
        //after a short delay, allow the dropdown to close
        setTimeout(function(){
          self.$el.removeClass('dropdown_module--stay-open');
        }, 1500);
      }
    });
  },

  _onMouseLeave : function(){
    // re-render so we're ready to display the next time the drop down gets opened
    this.render();
  }

});