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
  }

});