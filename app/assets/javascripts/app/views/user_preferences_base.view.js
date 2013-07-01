libs.shelbyGT.UserPreferencesBaseView = Support.CompositeView.extend({
  /*
    the preferences sections inherit this base view because
    they share common alert messaging & simple form validation tasks.
  */
  _preferencesSuccessMsg : {
    message: "<p>Your preferences have been updated!</p>",
    button_primary: {
      title: 'Ok'
    },
    button_secondary: {
      title: null
    }
  },

  _preferencesErrorMsg : {
    message: "<p>An unexpected error has occurred, <br/>please refresh the page and try again.</p>",
    button_primary: {
      title: 'Refresh'
    },
    button_secondary: {
      title: 'Dismiss'
    }
  },

  _preferencesErrorMsgCallback : function(returnVal){
    if(returnVal == libs.shelbyGT.notificationStateModel.ReturnValueButtonPrimary) {
      document.location.reload(true);
    }
  },

  _valueIsEmpty : function(val) {
    //we still need to know if a non-required field is empty
    return !val.length;
  },

  _updateUserPreferencesModel : function(updates) {
    //the user preferences is a object on the the usermodel
    //make a different function if you need to update the whole user model.
    var self = this;

    this.model.save({preferences: updates}, {
      success: function(model, response){
        shelby.alert(self._preferencesSuccessMsg);
      },
      error: function(model, response){
        shelby.alert(self._preferencesErrorMsg,self._preferencesErrorMsgCallback);
      }
    });
  },

  _doUpdateUserPreferences : function(updates){
    var defaults = _(this._preferences).clone();

    _(defaults).extend(updates);

    this._updateUserPreferencesModel(defaults);
  }

});