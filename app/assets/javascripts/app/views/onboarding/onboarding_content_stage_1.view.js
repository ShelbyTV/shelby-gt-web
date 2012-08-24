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
    "click .onboarding-next-step" : "_onNextStepClick"
  },

  initialize : function(){
    this.model.bind('change:nickname', this._onUsernameChange, this);
  },

  _cleanup : function(){
    this.model.unbind('change:nickname', this._onUsernameChange, this);
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
    this.model.set('password', $(event.currentTarget).val());
  },

  _onSaveSuccess : function(a, res){
    console.log('success', res.error());
  },

  _onSaveError : function(model, res){
    if (res.error){
      console.log(res.error());
    }
  },

  _onNextStepClick : function(){
    var self = this;
    shelby.models.user.save(this.model.toJSON(), {
      success : self._onSaveSuccess,
      error : self._onSaveError
    });
  }
  
});
