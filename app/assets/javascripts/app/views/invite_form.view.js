libs.shelbyGT.InviteFormView = Support.CompositeView.extend({

  events: {
    "click .js-send-invite:not(.js-busy)"  : "_sendInvite",
    "mouseleave"                           : "_onMouseLeave",
    "mouseleave :has(.js-invite-feedback)" : "_onMouseLeaveAfterSuccess"
  },

  template : function(obj){
      return SHELBYJST['invite-form'](obj);
  },

  render : function(){
    this._leaveChildren();
    this.$el.html(this.template({
      invite : this.model,
      user : this.options.user
    }));

    if (this.options.user.get('beta_invites_available') != 0) {
      var recipientsAutocompleteView = new libs.shelbyGT.EmailAddressAutocompleteView({
        el : this.$('.js-invite-email')[0],
        includeSources : ['email']
      });
      this.renderChild(recipientsAutocompleteView);
    } else {
      this.$('.js-invite-section-lining').html(SHELBYJST['invite-form-feedback']({
        feedback: 'Sorry, You Have No Invites Left',
        success: false
      }));
    }
  },

  _sendInvite : function(){

    var self = this;

    //stop responding to clicks on the button until the ajax returns
    this.$('.js-send-invite').addClass('js-busy');

    //hold the dropdown open until the ajax has finshed and we've given the user feedback on their action
    this.$el.addClass('dropdown_module--stay-open');

    this.model.save({
      to : this.$('.js-invite-email').val(),
      body : this.$('.js-invite-message').val()
    },{
      success : function(){
        //decrement the number of invites available
        self.options.user.set('beta_invites_available', self.options.user.get('beta_invites_available') - 1);
        //reset the email address and message to their defaults for the next invitation
        self.model.set({
          to : self.model.defaults['to'],
          body : self.model.defaults['body']
        });
        //show some feedback on the invite being successfully sent
        self.$('.js-invite-section-lining').html(SHELBYJST['invite-form-feedback']({
          feedback: 'Invitation Sent',
          success: true
        }));
        self._closeDropDownAfterUserFeedbackDelay();
      },
      error : function(inviteModel, response){
        //show some feedback on the invite failure
        var responseJSON = $.parseJSON(response.responseText);
        self._renderErrors(responseJSON.errors);
        self._closeDropDownAfterUserFeedbackDelay();
        //reactivate the button
        this.$('.js-send-invite').removeClass('js-busy');
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
    if (errors && errors.user && errors.user.beta_invites_available) {
      self.$('.js-invite-section-lining').html(SHELBYJST['invite-form-feedback']({
        feedback: 'Sorry, You Have No Invites Left',
        success: false
      }));
      this.options.user.set('beta_invites_available', 0);
    } else {
      // the ternary looks hacky but it's not because jQuery is using type detection to decide what to do with this parameter
      this.$('.js-invite-email-error').toggle(errors && errors.beta_invite && errors.beta_invite.to_email_address ? true : false);
    }
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