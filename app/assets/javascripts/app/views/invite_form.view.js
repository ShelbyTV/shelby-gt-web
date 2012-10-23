libs.shelbyGT.InviteFormView = Support.CompositeBehaviorView.extend({

  events: {
    "click .js-send-invite"                : "_sendInvite",
    "mouseleave"                           : "_onMouseLeave",
    "mouseleave :has(.js-invite-feedback)" : "_onMouseLeaveAfterSuccess"
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
        //reset the email address and message to their defaults for the next invitation
        self.model.set({
          to : self.model.defaults['to'],
          body : self.model.defaults['body']
        });
        //show some feedback on the invite being successfully sent
        self.$('.js-invite-section-lining').html(SHELBYJST['invite-form-feedback']);
        self._closeDropDownAfterUserFeedbackDelay();
      },
      error : function(inviteModel, response){
        //show some feedback on the invite failure
        var responseJSON = $.parseJSON(response.responseText);
        self._renderErrors(responseJSON.errors);
        self._closeDropDownAfterUserFeedbackDelay();
      }
    });
  },

  _closeDropDownAfterUserFeedbackDelay : function(){
    var self = this;

    //after a short delay, allow the dropdown to close
    setTimeout(function(){
      self.$el.removeClass('dropdown_module--stay-open');
      // if dropdown does close
      if (self.$('.js-invite-section:visible').length == 0) {
        // re-render so we're ready to display the next time it gets opened
        self.render();
        // clear any error messages
        self._renderErrors();
      }
    }, 1500);
  },

  _renderErrors : function(errors) {
    this.$('.js-invite-email-error').toggle(errors && errors.beta_invite && errors.beta_invite.to_email_address ? true : false);
  },

  _onMouseLeave : function(){
    // if the drop down will be closed,
    // clear error messages
    if (!this.$el.hasClass('dropdown_module--stay-open')) {
      this._renderErrors();
    }
  },

  _onMouseLeaveAfterSuccess : function(){
    // if the drop down will be closed,
    // re-render so we're ready to display the next time it gets opened
    if (!this.$el.hasClass('dropdown_module--stay-open')) {
      this.render();
    }
  }

});