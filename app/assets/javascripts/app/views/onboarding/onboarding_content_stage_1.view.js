var OnboardingContentStageBaseView = libs.shelbyGT.OnboardingContentStageBaseView;

libs.shelbyGT.OnboardingContentStage1View = OnboardingContentStageBaseView.extend({

  /*
   * Set stuff on the user model and hit save
   * Checkboxes as you're typing ..?
   * email type
   * pwd type
   * fix copy
   */

  _hasErrors      : false,

  events : {
    "keyup .form_input"              : "_onKeyupFormInput",
    "blur  .form_input"              : "_onBlurFormInput",
    "keyup #full-name"               : "_onUsernameInputKeyup",
    "keyup #password"                : "_onPwdInputKeyup",
    "keyup #email-address"           : "_onEmailInputKeyup",
    "click .js-signup-with-email"    : "_onNextStepClick",
    "click .js-onboarding-next-step" : "_onNextStepClick"
  },

  initialize : function(){
    this.model.set('primary_email', shelby.models.user.get('primary_email'));
    this.model.set('nickname', shelby.models.user.get('nickname'));
    shelby.models.user.bind('change:avatar_updated_at', this._onAvatarUploaded, this);
  },

  _cleanup : function(){
    shelby.models.user.unbind('change:avatar_updated_at', this._onAvatarUploaded, this);
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

  _onKeyupFormInput : function(event) {
    var signupPassword = this.$el.find('#signup-password'),
        submitButton   = this.$el.find('.js-onboarding-next-step'),
        hasErrors      = this._hasErrors;

    if(signupPassword.length && signupPassword.val().length >= shelby.config.user.password.minLength){
      this._validateForm(event);

      if(!hasErrors) {
        submitButton
          .toggleClass('button_default', false)
          .toggleClass('button_green', true);
      }
    } else {
      submitButton
        .toggleClass('button_default', true)
        .toggleClass('button_green', false);
    }
  },

  _onBlurFormInput : function(event) {
    var val = $(event.currentTarget).val().length;

    if(val != '' || val != undefined || val != null) {
      $(event.currentTarget).parent().removeClass('form_fieldset--error');
    }
  },

  _validateForm : function(event) {
    var signupName     = this.$el.find('#signup-name'),
        signupUsername = this.$el.find('#signup-username'),
        signupEmail    = this.$el.find('#signup-email'),
        signupPassword = this.$el.find('#signup-password'),
        submitButton   = this.$el.find('.js-onboarding-next-step'),
        hasErrors      = this._hasErrors = false;

      // validate user full name
      if(!signupName.val().length) {
        $('.js-invite-name').addClass('form_fieldset--error')
                            .find('.form_error')
                            .toggleClass('hidden', false)
                            .text('Please enter your name');
        hasErrors = true;
      } else {
        $('.js-invite-name')
                            .find('.form_error')
                            .toggleClass('hidden', true);

      }

      // validate username
      if(!signupUsername.val().length) {
        $('.js-invite-username').addClass('form_fieldset--error')
                                .find('.form_error')
                                .toggleClass('hidden', false)
                                .text('Please enter a username');
        hasErrors = true;
      } else {
        $('.js-invite-username')
                            .find('.form_error')
                            .toggleClass('hidden', true);
      }

      // validate password
      // var password
      if($('#signup-password').val().length < shelby.config.user.password.minLength) {
        $('.js-invite-password').addClass('form_fieldset--error')
                                .find('.form_error')
                                .toggleClass('hidden', false)
                                .text('Password must be at least ' + shelby.config.user.password.minLength + ' characters long');

        hasErrors = true;
      } else {
        $('.js-invite-password')
                            .find('.form_error')
                            .toggleClass('hidden', true);
      }
      // validate email
      if(!signupEmail.val().length || signupEmail.val().search(shelby.config.user.email.validationRegex) == -1) {
        $('.js-invite-email').addClass('form_fieldset--error')
                             .find('.form_error')
                             .toggleClass('hidden', false)
                             .text('Please enter a valid email.');

        hasErrors = true;
      } else {
        $('.js-invite-email')
                            .find('.form_error')
                            .toggleClass('hidden', true);
      }

      if (hasErrors) {
        event.preventDefault();
        $('.js-create-account')
          .toggleClass('button_green',false)
          .toggleClass('button_default', true);

      } else {
        // save the user's input in a session cookie so we can re-render it if API redirects us back
        // here with errors the user needs to fix
        cookies.set('_shelby_signup_name', signupName.val());
        cookies.set('_shelby_signup_username', signupUsername.val());
        cookies.set('_shelby_signup_email', signupEmail.val());
      }

  },

  _errorCleanup : function(event) {
    $(event.currentTarget).siblings('.form_error').toggleClass('hidden',true).parent().toggleClass('form_fieldset--error', false);
  },

  _onAvatarUploaded : function(event){
    var $submitButton = this.$el.find('.js-onboarding-next-step');

    if(shelby.models.user.get('has_shelby_avatar')){

      this._validateForm(event);

      $submitButton
        .removeAttr('disabled')
        .toggleClass('button_default visuallydisabled',false)
        .toggleClass('button_green',true);
    }
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
    $('.js-invite-username-input-error').toggleClass('hidden',true);
    $('.js-invite-email-input-error').toggleClass('hidden',true);
    $('.js-invite-pwd-input-error').toggleClass('hidden',true);

    if (_.include(fields, 'nickname')){
      $('.js-invite-username-input-error').text(isBeforeSubmit ? 'Please enter a nickname' : 'Sorry, that username is already taken').toggleClass('hidden',false);
      $('.js-invite-name').toggleClass('form_fieldset--error',true);
    }
    if (_.include(fields, 'primary_email')){
      $('.js-invite-email-input-error').text(isBeforeSubmit ? 'Please enter a valid email' : 'Sorry, that email is already taken').toggleClass('hidden',false);
      $('.js-invite-email').toggleClass('form_fieldset--error',true);
    }
    if (_.include(fields, 'password')){
      $('.js-invite-password-input-error').text('Please enter a password that\'s at least ' + shelby.config.user.password.minLength + ' characters long').toggleClass('hidden',false);
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
      $('.js-invite-password-input-error').toggleClass('hidden',false);
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
