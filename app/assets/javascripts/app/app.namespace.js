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

  // shelby.alert mimicks js native alert functionality.
  // optional: add a callback function to execute after alert is dismissed
  alert: function(opts, callback){
    opts = _.extend(shelby.models.notificationState.defaults, {
      'class'    : 'notification--alert',
      'visible'  : true
    }, opts);

    shelby.models.notificationState.bind('change:response', function(r){
      if (callback) { callback( r.get('response') ); }
      r.unbind('change:response');
    });

    shelby.models.notificationState.set(opts);
  },

  // shelby.success is designed to show a non-intrusive success message
  // will self-dismiss if not X'd by user
  success: function(opts){
    opts = _.extend(shelby.models.notificationState.defaults, {
      'class'    : 'notification--success',
      'visible'  : true
    }, opts);

    shelby.models.notificationState.set(opts);
    //ghetto auto-hide
    setTimeout(function(){
      shelby.models.notificationState.set({visible: false});
    }, opts.timeout || 9000);
  }
});