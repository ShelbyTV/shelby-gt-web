libs.shelbyGT.UserPreferencesSignupView = libs.shelbyGT.UserPreferencesBaseView.extend({

  events : {
  },

  className: 'content_lining preferences_page preferences_page--signup',

  options : _.extend({}, libs.shelbyGT.UserPreferencesBaseView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-signup'](obj);
  },

  render : function(){
    var viewData = {
      authToken    : $('meta[name=csrf-token]').attr('content'),
      csrfParam    : $('meta[name=csrf-param]').attr('content')//,
      // userEmail    : "this.model.get('primary_email')",
      // userFullname : "this.model.get('name')",
      // userNickname : "this.model.get('nickname')",
    };

    this.$el.html(this.template(viewData));
  },

  initialize : function(){
  },

  _cleanup : function(){
  },

  _onSubmit : function(e){
    e.preventDefault();
  }//,

  // _updateUser : function(updates) {
  //   var self = this;

  //   this.model.save(updates, {
  //     success: function(model, response){
  //       shelby.alert(self._preferencesSuccessMsg);
  //     },
  //     error: function(model, response){
  //       if (response.status == 409) {
  //         var data = $.parseJSON(response.responseText);
  //         var errors = _(data.errors.user);

  //         if(errors.has('nickname')) {
  //           // console.log(self._$userNickname);
  //           self._$userNickname.prev('.form_error').text("Username already in use")
  //                              .parent('.form_fieldset').addClass('form_fieldset--error');
  //         } else if (errors.has('primary_email')) {
  //           self._$userEmail.prev('.form_error').text("Email already in use")
  //                           .parent('.form_fieldset').addClass('form_fieldset--error');
  //         } else {
  //           //if error unidentified, suggest page refresh (to alleviate possible authentication problem)
  //           shelby.alert(self._preferencesErrorMsg,self._preferencesErrorMsgCallback);
  //         }
  //       } else {
  //         shelby.alert(self._preferencesErrorMsg,self._preferencesErrorMsgCallback);
  //       }
  //     },
  //     wait: true
  //   });
  // },

  // _clearErrors : function() {
  //   this.$('.form_fieldset').removeClass('form_fieldset--error');
  // },

});
