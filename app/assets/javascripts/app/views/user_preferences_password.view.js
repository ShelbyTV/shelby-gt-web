libs.shelbyGT.UserPreferencesPasswordView = libs.shelbyGT.UserPreferencesBaseView.extend({

  events : {
    "submit .js-preferences-password" : "_onSubmit",
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
    console.log('/preferences/password!');
  },

  _cleanup : function(){
  },

  _onSubmit : function(e){
    e.preventDefault();

    this._$newPassword        = $('#newPassword'),
    this._$newPasswordConfirm = $('#newPasswordConfirm');

    if(info.password.length < shelby.config.user.password.minLength){
      this._$newPassword.prev('.form_error').text('Password must be at least' + shelby.config.user.password.minLength + "characters")
                        .parent().toggleClass('form_fieldset--error',true);
    }
    // the new password is not state that we want/need to persist on the client side,
    // so we create a temporary clone of the user model with only password info via which
    // to save the password to the backend (using HTTPS)
    this._modelClone = new libs.shelbyGT.UserModel({
      id : this.model.id,
      password : this._$newPassword,
      password_confirmation : this._$newPasswordConfirm
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