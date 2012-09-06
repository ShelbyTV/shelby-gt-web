libs.shelbyGT.OnboardingContentStage1View = libs.shelbyGT.OnboardingContentStageBaseView.extend({

  /*
   * Set stuff on the user model and hit save
   * Checkboxes as you're typing ..?
   * email type 
   * pwd type
   * fix copy
   */

  events : {
    "keyup #js-onboarding-username-input" : "_onUsernameInputKeyup",
    "keyup #js-onboarding-pwd-input" : "_onPwdInputKeyup",
    "keyup #js-onboarding-email-input" : "_onEmailInputKeyup",
    "click .js-onboarding-next-step" : "_onNextStepClick"
  },

  initialize : function(){
    this.model.set('primary_email', shelby.models.user.get('primary_email'));
    this.model.set('nickname', shelby.models.user.get('nickname'));
    this.model.bind('change:nickname', this._onUsernameChange, this);
  },

  _cleanup : function(){
    this.model.unbind('change:nickname', this._onUsernameChange, this);
  },

  render : function(){
    console.log('rendering comp view '+this.options.stage);
    this.$el.html(this.template());
    this._userAvatar = new libs.shelbyGT.UserAvatarPresenterView({
      el: this.$('.js-dynamic-user-avatar')[0]
    });
    this.renderChild(this._userAvatar);
    
    this._userAvatarUploader = new libs.shelbyGT.UserAvatarUploaderView({
      el: this.$('.js-user-avatar-uploader')[0],
      spinnerEl: this.$('.dynamic-avatar .spinner-overlay')[0],
      progressEl: this.$('.dynamic-avatar .progress-overlay')[0]
    });

    this.renderChild(this._userAvatarUploader);
    return this;
  },

  _onUsernameChange : function(model, username){
    this.$('.js-onboarding-url-username').text(username);
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

  _onSaveSuccess : function(){
    this.$('.js-onboarding-next-step').text('Get Started');
    shelby.router.navigate('onboarding/2', {trigger:true});
  },

  _onSaveError : function(model, even, response){
    $('.js-onboarding-username-input-error').text('Sorry, that username is already taken').show();
  },

  _getInvalidFields : function(){
    var invalidFields = [];
    if (!this.model.get('nickname') || !this.model.get('nickname').length){
      invalidFields.push('nickname');
    }
    if (!shelby.models.user.get('has_password')){
      if (!this.model.get('password') || !this.model.get('password').length || this.model.get('password').length<5){
        invalidFields.push('password');
      }
    }
    if (!this.model.get('primary_email') || !this.model.get('primary_email').length || this.model.get('primary_email').indexOf('@')===-1){
      invalidFields.push('primary_email');
    }
    return invalidFields;
  },

  _displayErrors : function(fields){
    if (_.include(fields, 'nickname')){
      $('.js-onboarding-username-input-error').text('Please enter a nickname.').show();
    }
    if (_.include(fields, 'primary_email')){
      $('.js-onboarding-email-input-error').text('Please enter a valid email.').show();
    }
    if (_.include(fields, 'password')){
      $('.js-onboarding-pwd-input-error').text('Please enter a password that\'s at least 5 characters long.').show();
    }
  },

  _onNextStepClick : function(){
    var invalidFields = this._getInvalidFields();
    if (invalidFields.length){
      return this._displayErrors(invalidFields);
    }
    this.$('.js-onboarding-next-step').text('Working...');
    var self = this;
    shelby.models.user.save(this.model.toJSON(), {
      success : self._onSaveSuccess,
      error : self._onSaveError
    });
  }
  
});
