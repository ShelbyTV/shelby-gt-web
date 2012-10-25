libs.shelbyGT.InviteFormView = Support.CompositeView.extend({

  _autoCloseTimeoutId : null,

  events: {
    "click .js-invite"                     : "_toggleDropdown",
    "change .js-invite-email"              : "_updateEmail",
    "change .js-invite-message"            : "_updateMessage",
    "click .js-send-invite:not(.js-busy)"  : "_sendInvite"
  },

  template : function(obj){
      return SHELBYJST['invite-form'](obj);
  },

  initialize : function() {
    this.options.user.bind('change:beta_invites_available', this._updateInvitesAvailable, this);
    this.model.bind('invite:open', this._openDropdown, this);
  },

  _cleanup : function(){
    this.options.user.unbind('change:beta_invites_available', this._updateInvitesAvailable, this);
    this.model.unbind('invite:open', this._openDropdown, this);
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
      this.$('.js-invites-remaining').hide();
      this.$('.js-invite-section-lining').html(SHELBYJST['invite-form-feedback']({
        feedback: "Keep watching and rolling, and we'll get you some more invites...",
        success: false
      }));
    }
  },

  _toggleDropdown : function() {
    // cancel any auto-close timeout
    clearTimeout(this._autoCloseTimeoutId);
    if (!this.$('.js-invite-section').toggle().is(':visible')) {
      // if dropdown closed
      this.options.inviteViewState.set('open', false);
      // re-render so we're ready to display next time it opens
      this.render();
      // let screen elements fade out again
      shelby.userInactivity.enableUserActivityDetection();
    } else {
      // if dropdown opened
      this.options.inviteViewState.set('open', true);
      // don't let screen elements fade out until dropdown is closed
      shelby.userInactivity.disableUserActivityDetection();
      if (!this.options.user.get('beta_invites_available')) {
        // if the user doesn't have any invites left, auto close after a bit
        this._closeDropDownAfterUserFeedbackDelay(3000);
      }
    }
  },

  _updateEmail : function(e) {
    this.model.set({to: $(e.currentTarget).val()});
  },

  _updateMessage : function(e) {
    this.model.set({body: $(e.currentTarget).val()});
  },

  _sendInvite : function(){

    var self = this;

    //stop responding to clicks on the button until the ajax returns
    this.$('.js-send-invite').addClass('js-busy');

    this.model.save(null, {
      success : function(){
        //decrement the number of invites available
        self.options.user.set('beta_invites_available', self.options.user.get('beta_invites_available') - 1);
        //show some feedback on the invite being successfully sent
        self.$('.js-invite-section-lining').html(SHELBYJST['invite-form-feedback']({
          feedback: 'Thanks for sending an invite!',
          success: true
        }));
        //reset the email address and message to their defaults for the next invitation
        self.model.set({
          to : self.model.defaults['to'],
          body : self.model.defaults['body']
        });
        self._closeDropDownAfterUserFeedbackDelay(1500);
      },
      error : function(inviteModel, response){
        //show some feedback on the invite failure
        var errors = $.parseJSON(response.responseText).errors;
        self._renderErrors(errors);
        //reactivate the button
        this.$('.js-send-invite').removeClass('js-busy');
        if (errors && errors.user && errors.user.beta_invites_available) {
          self._closeDropDownAfterUserFeedbackDelay(1500);
        }
      }
    });
  },

  _closeDropDownAfterUserFeedbackDelay : function(ms){
    var self = this;

    // cancel any previous auto-close timeout
    clearTimeout(this._autoCloseTimeoutId);

    //after a short delay, close the dropdown
    this._autoCloseTimeoutId =
      setTimeout(function(){
        self.$('.js-invite-section').hide();
        self.options.inviteViewState.set('open', false);
        // re-render so we're ready to display the next time it gets opened
        self.render();
        // let screen elements fade out again
        shelby.userInactivity.enableUserActivityDetection();
      }, ms);
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

  _updateInvitesAvailable : function(userModel, invitesAvailable) {
    if (invitesAvailable) {
      this.$('.js-invites-remaining').text(invitesAvailable);
      this.$('.js-invites-remaining').show();
    } else {
      this.$('.js-invites-remaining').hide();
    }
  },

  _openDropdown : function() {
    this.$('.js-invite-section').show();
    this.options.inviteViewState.set('open', true);
    // don't let screen elements fade out until dropdown is closed
    shelby.userInactivity.disableUserActivityDetection();
    if (!this.options.user.get('beta_invites_available')){
      // if the user doesn't have any invites left, auto close after a bit
      this._closeDropDownAfterUserFeedbackDelay(2000);
    }
  }

});