libs.shelbyGT.UserPreferencesView = Support.CompositeView.extend({

  _responseFadeTimeout : null,

  _securityResponseFadeTimeout : null,

  events: {
    "click .js-user-save:not(.js-busy)":  "_submitContactInfo",
    "click .js-user-password-save:not(.js-busy)": "_submitPassword",
    "click .js-user-cancel": "_cancel",
    "click #show-change-password": "_showChangePassword",
    "change #you-preferences-email-updates": "_toggleEmailUpdates",
    "change #you-preferences-email-comments": "_toggleCommentEmails",
    "change #you-preferences-email-rerolls": "_toggleRerollEmails",
    "change #you-preferences-email-joinrolls": "_toggleJoinrollEmails",
    "change #you-preferences-timeline-sharing": "_toggleTimelineSharing"
  },

  template : function(obj){
    return JST['user-preferences'](obj);
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));

    this._userAvatar = new libs.shelbyGT.UserAvatarPresenterView({
      el: this.$('#js-dynamic-user-avatar')[0]
    });
    this.renderChild(this._userAvatar);

    this._userAvatarUploader = new libs.shelbyGT.UserAvatarUploaderView({
      el: this.$('#js-user-avatar-uploader')[0],
      spinnerEl: this.$('.dynamic-avatar .spinner-overlay')[0],
      progressEl: this.$('.dynamic-avatar .progress-overlay')[0]
    });
    this.renderChild(this._userAvatarUploader);
  },

  _showChangePassword: function(e){
    this.$("#you-preferences-change-password").show();
    e.preventDefault();
  },

  _cancel: function(){
    //TODO: what should cancel really do?
    // -1 (or .back) seems to bring us to the wrong place.
    window.history.back();
  },

  _submitContactInfo: function(e){
    var self = this;
    var _email = this.$('#you-preferences-email').val();
    // make sure this is a valid email address
    if (_email.search(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i) == -1) {
      self._updateResponse("email invalid.");
      return;
    }
    var _username = this.$('#you-preferences-username').val();
    var info = {primary_email: _email, nickname: _username};
    var $thisButton = $(e.currentTarget).addClass('js-busy');
    this.model.save(info, {
      success: function(model, resp){
        self._updateResponse("saved!");
        $thisButton.removeClass('js-busy');
      },
      error: function(model, resp){
        if (resp.status == 409) {
          self._updateResponse("sorry, username taken.");
        } else {
          self._updateResponse("unexpected error. try again later.");
        }
        $thisButton.removeClass('js-busy');
      },
      wait: true
    });
  },

  _submitPassword: function(e){
    var self = this;
    var info = {
      id: this.model.id,
      password: this.$('#you-preferences-password').val(),
      password_confirmation: this.$('#you-preferences-password-confirmation').val()
      };

    if(info.password.length < shelby.config.user.password.minLength){
      self._updateSecurityResponse("password must be at least " + shelby.config.user.password.minLength + " characters.");
      return;
    }

    var $thisButton = $(e.currentTarget).addClass('js-busy');
    // the new password is not state that we want/need to persist on the client side,
    // so we create a temporary clone of the user model with only password info via which
    // to save the password to the backend
    var userClone = new libs.shelbyGT.UserModel(info);
    userClone.save(null, {
      success: function(model, resp){
        self._updateSecurityResponse("password updated!");
        $thisButton.removeClass('js-busy');
      },
      error: function(model, resp){
        if (resp.status == 409) {
          self._updateSecurityResponse("passwords did not match.");
        } else {
          self._updateSecurityResponse("unexpected error. try again later.");
        }
        $thisButton.removeClass('js-busy');
      }
    });
  },

  _updateResponse: function(msg){
    var self = this;
    if (this._responseFadeTimeout) {
      clearTimeout(this._responseFadeTimeout);
      delete this._responseFadeTimeout;
    }
    this.$('.js-response-message').stop(true, true).text(msg).show();
    this._responseFadeTimeout = setTimeout(function(){
      self.$('.js-response-message').fadeOut('fast', function() { $(this).text(""); });
      delete self._responseFadeTimeout;
    }, 3000);
  },

  _updateSecurityResponse: function(msg){
    var self = this;
    if (this._securityResponseFadeTimeout) {
      clearTimeout(this._securityResponseFadeTimeout);
      delete this._securityResponseFadeTimeout;
    }
    this.$('.js-security-response-message').stop(true, true).text(msg).show();
    this._securityResponseFadeTimeout = setTimeout(function(){
      self.$('.js-security-response-message').fadeOut('fast', function() { $(this).text(""); });
      delete this._securityResponseFadeTimeout;
    }, 3000);
  },

  _toggleEmailUpdates: function(){
    this._toggleCheckboxSelection('email_updates', '#you-preferences-email-updates');
  },

  _toggleCommentEmails: function(){
    this._toggleCheckboxSelection('comment_notifications', '#you-preferences-email-comments');
  },

  _toggleRerollEmails: function(){
    this._toggleCheckboxSelection('reroll_notifications', '#you-preferences-email-rerolls');
  },

  _toggleJoinrollEmails: function(){
    this._toggleCheckboxSelection('roll_activity_notifications', '#you-preferences-email-joinrolls');
  },

  _toggleTimelineSharing: function(){
    this._toggleCheckboxSelection('open_graph_posting', '#you-preferences-timeline-sharing');
  },

  // the future

  _toggleCheckboxSelection: function(prefAttribute, checkBoxSelector) {
    var _prefs = _.clone(this.model.get('preferences'));
    _prefs[prefAttribute] = this.$(checkBoxSelector).is(':checked') ? true : false;
    this.model.save({preferences: _prefs});
  }

});