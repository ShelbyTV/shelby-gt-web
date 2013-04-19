libs.shelbyGT.OnboardingContentStage1View = libs.shelbyGT.OnboardingContentStageBaseView.extend({

  /*
   * Set stuff on the user model and hit save
   * Checkboxes as you're typing ..?
   * email type
   * pwd type
   * fix copy
   */

  events : {
    "keyup #full-name"               : "_onUsernameInputKeyup",
    "keyup #password"                : "_onPwdInputKeyup",
    "keyup #email-address"           : "_onEmailInputKeyup",
    "click .js-signup-with-email"    : "_onNextStepClick",
    "click .js-onboarding-next-step" : "_onNextStepClick"
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

  _errorCleanup : function(event) {
    $(event.currentTarget).siblings('.form_error').toggleClass('hidden',true).parent().toggleClass('form_fieldset--error', false);
  },

  _onUsernameInputKeyup : function(event){
    this._errorCleanup(event);

    this.model.set('nickname', $(event.currentTarget).val());
  },

  _onEmailInputKeyup : function(event){
    this._errorCleanup(event);

    this.model.set('primary_email', $(event.currentTarget).val());
  },

  _onPwdInputKeyup : function(event){
    this._errorCleanup(event);

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
    $('.js-onboarding-username-input-error').toggleClass('hidden',true);
    $('.js-onboarding-email-input-error').toggleClass('hidden',true);
    $('.js-onboarding-pwd-input-error').toggleClass('hidden',true);

    if (_.include(fields, 'nickname')){
      $('.js-onboarding-username-input-error').text(isBeforeSubmit ? 'Please enter a nickname.' : 'Sorry, that username is already taken.').toggleClass('hidden',false);
      $('.js-invite-name').toggleClass('form_fieldset--error',true);
    }
    if (_.include(fields, 'primary_email')){
      $('.js-onboarding-email-input-error').text(isBeforeSubmit ? 'Please enter a valid email.' : 'Sorry, that email is already taken.').toggleClass('hidden',false);
      $('.js-invite-email').toggleClass('form_fieldset--error',true);
    }
    if (_.include(fields, 'password')){
      $('.js-onboarding-pwd-input-error').text('Please enter a password that\'s at least ' + shelby.config.user.password.minLength + ' characters long.').toggleClass('hidden',false);
      $('.js-invite-password').toggleClass('form_fieldset--error',true);
    }


  },

  _onNextStepClick : function(e){
    e.preventDefault();

    var self = this,
        invalidFields = this._getInvalidFields(),
        createAccountButton = this.$('.js-onboarding-next-step');

    this._renderErrors(invalidFields, true);

    var $password = $('#password');

    if($password == '' || $password == null || $password == undefined) {
      $password.parent('.form_fieldset').addClass('.form_fieldset--error');
      $('.js-onboarding-pwd-input-error').toggleClass('hidden',false);
    }

    if (invalidFields.length){
      return;
    }

    createAccountButton.text('Working...');

    var modelJson = this.model.toJSON();
    if (shelby.models.user.get('has_password')) {
      modelJson = _(modelJson).omit('password', 'password_confirmation');
    }

    shelby.models.user.save(modelJson, {
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
