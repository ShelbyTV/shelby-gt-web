libs.shelbyGT.OnboardingContentStage1View = libs.shelbyGT.OnboardingContentStageBaseView.extend({

  /*
   * Set stuff on the user model and hit save
   * Checkboxes as you're typing ..?
   * email type
   * pwd type
   * fix copy
   */

  events : {
    "keyup #full-name"            : "_onUsernameInputKeyup",
    "keyup #password"             : "_onPwdInputKeyup",
    "keyup #email-address"        : "_onEmailInputKeyup",
    "click .js-signup-with-email" : "_onNextStepClick"
  },

  initialize : function(){
    this.model.set('primary_email', shelby.models.user.get('primary_email'));
    this.model.set('nickname', shelby.models.user.get('nickname'));
    // this.model.bind('change:nickname', this._onUsernameChange, this);
  },

  _cleanup : function(){
    // this.model.unbind('change:nickname', this._onUsernameChange, this);
  },

  render : function(){
    this.$el.html(this.template());
    this._userAvatar = new libs.shelbyGT.UserAvatarPresenterView({
      el: this.$('.js-dynamic-user-avatar')[0],
      avatarSize: libs.shelbyGT.UserAvatarSizes.large
    });
    this.renderChild(this._userAvatar);

    this._userAvatarUploader = new libs.shelbyGT.UserAvatarUploaderView({
      el: this.$('.js-user-avatar-uploader')[0],
      progressEl: this.$('.dynamic-avatar .progress-overlay')[0],
      progressMessageEl: this.$('.dynamic-avatar .progress-message')[0]
    });

    shelby.track('started onboarding', {userName: shelby.models.user.get('nickname')});
    this.renderChild(this._userAvatarUploader);
    return this;
  },

  _onUsernameInputKeyup : function(event){
    this.model.set('nickname', $(event.currentTarget).val());
  },

  _onEmailInputKeyup : function(event){
    this.model.set('primary_email', $(event.currentTarget).val());
  },

  _onPwdInputKeyup : function(event){
    var pwd = $(event.currentTarget).val();
    this.model.set({
      password: pwd,
      password_confirmation: pwd
    });
  },

  _getInvalidFields : function(){
    var invalidFields = [];
    if (!this.model.get('nickname') || !this.model.get('nickname').length){
      invalidFields.push('nickname');
    }
    if (!shelby.models.user.get('has_password')){
      if (!this.model.get('password') || this.model.get('password').length<shelby.config.user.password.minLength){
        invalidFields.push('password');
      }
    }
    if (!this.model.get('primary_email') || this.model.get('primary_email').search(shelby.config.user.email.validationRegex) == -1){
      invalidFields.push('primary_email');
    }
    return invalidFields;
  },

  _renderErrors : function(fields, isBeforeSubmit){
    //hide any old error messages
    $('.js-onboarding-username-input-error').hide();
    $('.js-onboarding-email-input-error').hide();
    $('.js-onboarding-pwd-input-error').hide();

    if (_.include(fields, 'nickname')){
      $('.js-onboarding-username-input-error').text(isBeforeSubmit ? 'Please enter a nickname.' : 'Sorry, that username is already taken.').show();
    }
    if (_.include(fields, 'primary_email')){
      $('.js-onboarding-email-input-error').text(isBeforeSubmit ? 'Please enter a valid email.' : 'Sorry, that email is already taken.').show();
    }
    if (_.include(fields, 'password')){
      $('.js-onboarding-pwd-input-error').text('Please enter a password that\'s at least ' + shelby.config.user.password.minLength + ' characters long.').show();
    }
  },

  _onNextStepClick : function(){
    var self = this,
        invalidFields = this._getInvalidFields(),
        createAccountButton = this.$('.js-onboarding-next-step');

    this._renderErrors(invalidFields, true);

    if (invalidFields.length){
      return;
    }

    createAccountButton.text('Working...');

    shelby.models.user.save(this.model.toJSON(), {
      success : function(){
        shelby.models.user.get('app_progress').advanceStage('onboarding', 1);
        shelby.router.navigate('onboarding/2', {trigger:true});
      },
      error : function(model, resp){
        self.$('.js-onboarding-next-step').text('Get Started');
        var r = $.parseJSON(resp.responseText);
        self._renderErrors(_.keys(r.errors.user));
      }
    });
  }

});
