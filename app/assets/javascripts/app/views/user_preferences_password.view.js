libs.shelbyGT.UserPreferencesPasswordView = libs.shelbyGT.UserPreferencesBaseView.extend({

  events : {
    "submit .js-preferences-password" : "_onSubmit",
    "reset .js-preferences-password"  : "_clearErrors",
    "blur .form_input"                : "_toggleRequiredAttr"
  },

  className: 'content_lining preferences_page preferences_page--password',

  options : _.extend({}, libs.shelbyGT.UserPreferencesBaseView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-password'](obj);
  },

  render : function(){
    var data = {};

    this.$el.html(this.template(data));
  },

  initialize : function(){
    this._preferences = this.model.get('preferences');
  },

  _cleanup : function(){
  },

  _onSubmit : function(e){
    e.preventDefault();

    this._$newPassword        = $('#newPassword'),
    this._$newPasswordConfirm = $('#newPasswordConfirm');

    var hasError = null;

    if (this._$newPassword.val().length < shelby.config.user.password.minLength) {
      hasError = 'Password must be at least ' + shelby.config.user.password.minLength + ' characters';
      this._$newPassword.prev('.form_error').text(hasError)
                        .parent().toggleClass('form_fieldset--error',true);
    } else if (this._$newPassword.val() != this._$newPasswordConfirm.val()) {
      hasError = 'Passwords do not match';
      this._$newPasswordConfirm.prev('.form_error').text(hasError)
                               .parent().toggleClass('form_fieldset--error',true);
    }

    if (hasError){
      return false;
    }
    // the new password is not state that we want/need to persist on the client side,
    // so we create a temporary clone of the user model with only password info via which
    // to save the password to the backend (using HTTPS)
    this._modelClone = new libs.shelbyGT.UserModel({
      id : this.model.id,
      password : this._$newPassword.val(),
      password_confirmation : this._$newPasswordConfirm.val()
    });

    this._modelClone.useSecureUrl = true;

    var self = this;

    this._modelClone.save(null,{
      success : function(model, response){
        shelby.alert(self._preferencesSuccessMsg);
      },
      error : function(model, response){
        var error;

        if(response == 409) {
          error = {
            message: "Try again, passwords did not match.",
            button_primary: {
              title: 'Dismiss'
            },
            button_secondary: {
              title:null
            }
          };
        } else {
          error = self._preferencesErrorMsg;
        }

        shelby.alert(error);
      }
    });
  },

  _clearErrors : function() {
    this.$('.form_fieldset').removeClass('form_fieldset--error');
  },

  _toggleRequiredAttr : function(e) {
    //only apply the `required` attribute onBlur,
    //this is because the browser will add a
    //pink background color before the user interacts
    //with the form inputs.
    //it doesn't make sense in this context.
    //so, only until the user has blurred either input should we
    //append the `required`

    var $this = $(e.currentTarget);

    $this.attr('required',true);
  }

});