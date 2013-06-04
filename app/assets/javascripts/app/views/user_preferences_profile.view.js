libs.shelbyGT.UserPreferencesProfileView = Support.CompositeView.extend({

  events : {
    "submit .js-submit-profile" : "_onSubmit"
  },

  className: 'content_lining preferences_page preferences_page--profile',

  options : _.extend({}, Support.CompositeView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-profile'](obj);
  },

  render : function(){
    var viewData = {
      userFullname : this.model.get('name'),
      userNickname : this.model.get('nickname'),
      userEmail    : this.model.get('primary_email')
    };

    this.$el.html(this.template(viewData));

    //display avatar
    this._userAvatar = new libs.shelbyGT.UserAvatarPresenterView({
      el    : this.$('#js-dynamic-user-avatar')[0],
      model : this.model
    });

    this.renderChild(this._userAvatar);

    //uploading managaer
    this._userAvatarUploader = new libs.shelbyGT.UserAvatarUploaderView({
      el         : this.$('#js-user-avatar-uploader')[0],
      model      : this.model,
      progressEl : this.$('.dynamic-avatar .progress-overlay')[0],
      spinnerEl  : this.$('.dynamic-avatar .spinner-overlay')[0]
    });
    this.renderChild(this._userAvatarUploader);

  },

  initialize : function(){
    console.log('/preferences/profile!');
  },

  _cleanup : function(){
  },

  _onSubmit : function(e){
    e.preventDefault();

    this._$userFullname    = $('#userFullname'),
    this._$userNickname    = $('#userNickname'),
    this._$userEmail       = $('#userEmail'),
    this._$userDescription = $('#userDescription'),
    this._$userHomepage    = $('#userHomepage');

    var updates = {
      //grabbing defaults from current model
      name : this.model.get('name'),
      nickname : this.model.get('nickname'),
      primary_email : this.model.get('primary_email')
    };

    if(!this._valueIsEmpty(this._$userFullname.val())) {
      updates.name = this._$userFullname.val();
    }

    if(!this._valueIsEmpty(this._$userNickname.val())) {
      updates.nickname = this._$userNickname.val();
    }

    if(!this._valueIsEmpty(this._$userEmail.val()) && this._$userEmail.val().search(shelby.config.user.email.validationRegex) != -1) {
      updates.primary_email = this._$userEmail.val();
    }

    // UI doesn't exist yet …yet
    // if(!this._valueIsEmpty(_userDescription)) {
    //   updates. = _userDescription;
    // }

    // if(!this._valueIsEmpty(_userHomepage)) {
    //   updates. = _userHomepage;
    // }

    this._updateUser(updates);
  },

  _valueIsEmpty : function(val) {
    //we still need to know if a non-required field is empty
    return !val.length;
  },

  _updateUser : function(updates) {
    var self = this;

    this.model.save(updates, {
      success: function(model, response){
        console.log('success',response);

        var successMsg = {
          message: "<p>Your preferences have been updated!</p>",
          button_primary: {
            title: 'Ok'
          },
          button_secondary: {
            title: null
          }
        };

        shelby.alert(successMsg);
      },
      error: function(model, response){
        console.log('error',response);
        var errorMsg = {
          message: "<p>An unexpected error has occurred, <br/>please refresh the page and try again.</p>",
          button_primary: {
            title: 'Refresh'
          },
          button_secondary: {
            title: 'Dismiss'
          }
        };

        if (response.status == 409) {
          var data = $.parseJSON(response.responseText);
          var errors = _(data.errors.user);

          if(errors.has('nickname')) {
            // console.log(self._$userNickname);
            self._$userNickname.prev('.form_error').text("Username already in use")
                               .parent('.form_fieldset').addClass('form_fieldset--error');
          } else if (errors.has('primary_email')) {
            self._$userEmail.prev('.form_error').text("Username already in use")
                            .parent('.form_fieldset').addClass('form_fieldset--error');
          } else {
            //if error unidentified, suggest page refresh (to alleviate possible authentication problem)
            shelby.alert(errorMsg,function(returnVal){
              if(returnVal == libs.shelbyGT.notificationStateModel.ReturnValueButtonPrimary) {
                document.location.reload(true);
              }
            });
          }
        } else {
          shelby.alert(errorMsg,function(returnVal){
            if(returnVal == libs.shelbyGT.notificationStateModel.ReturnValueButtonPrimary) {
              document.location.reload(true);
            }
          });
        }
      },
      wait: true
    });
  }

});