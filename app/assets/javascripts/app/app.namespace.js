//---------------------------------------------------------
// global mechanism for including library prototypes
//---------------------------------------------------------
libs = {
  shelbyGT : {
    viewHelpers : {}
  },
  utils : {}
};

if (typeof(shelby) == 'undefined') {
  shelby = {};
}

//---------------------------------------------------------
// global namespace for this app
//---------------------------------------------------------
_(shelby).extend({
  models : {},
  views : {},
  collections : {},

  // Signed in convience function
  userSignedIn: function(){
    var _cookie = cookies.get("_shelby_gt_common");
    var _pieces = _cookie.split(',');
    return _pieces[0].split("=").length == 2 ? _pieces[0].split("=")[1] !== "nil" ? true : false : false;
  },

  signOut: function(){
    document.location.href = "/signout";
  },

  // shelby.dialog(options, callback);
  //   - prompts the user with one, or two buttons depending on the context
  //   - does not auto-dismiss
  //   - callback receives notificationState.result
  //     button_primary == 1
  //     button_secondary == 0


  //  EXAMPLE OPTS:
  // notificationOpts = {
  //   message: "In order to provide a great experience we need you to re-authenticate with facebook. Don't worry, you'll be re-directed back to Shelby. Yay!",
  //   button_primary: {
  //     title: 'Re-authenticate Facebook'
  //   },
  //   button_secondary: {
  //     title: 'No thanks'
  //   }
  // }

  //  EXAMPLE CALLBACK:
  //  function(returnVal){
  //    if (returnVal == libs.shelbyGT.notificationStateModel.ReturnValueButtonPrimary){
  //       self._doSomething();
  //    }
  //  }
  dialog: function(notificationOpts, callback){
    if(this._notificationTimer){ clearTimeout(this._notificationTimer); }

    opts = _.extend(shelby.models.notificationState.defaults, {
      'class'    : 'notification--dialog',
      'visible'  : true
    }, notificationOpts);

    shelby.models.notificationState.set(opts);

    shelby.models.notificationState.bind('change:response', function(r){
      if (callback) { callback( r.get('response') ); }
      r.unbind('change:response');
    });
  },

  // shelby.alert(options, callback);
  //  - Same as above.
  //  - AUTO DISMISSES AFTER 9 seconds
  alert: function(alertOpts, callback){
    if(this._notificationTimer){ clearTimeout(this._notificationTimer); }

    opts = _.extend(shelby.models.notificationState.defaults, {
      'class'    : 'notification--alert',
      'visible'  : true
    }, alertOpts);

    shelby.models.notificationState.set(opts);

    //auto-hide
    this._notificationTimer = setTimeout(function(){
      shelby.models.notificationState.set({visible: false});
    }, opts.timeout || 9000);

    shelby.models.notificationState.bind('change:response', function(r){
      if (callback) { callback( r.get('response') ); }
      r.unbind('change:response');
      clearTimeout(this._notificationTimer);
    });
  },

  _notificationTimer: null
});