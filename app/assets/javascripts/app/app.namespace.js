//---------------------------------------------------------
// global mechanism for including library prototypes
//---------------------------------------------------------
libs = {
  shelbyGT : {
    viewHelpers : {}
  },
  utils : {}
};

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
  alert: function(message, callback){
    shelby.models.notificationState.bind('change:response', function(r){
      if (callback) { callback( r.get('response') ); }
      r.unbind('change:response');
    });
    shelby.models.notificationState.set({ 'message': message,
                                          'visible': true,
                                          'button_one' : {visible: true, text: "Ok", color: 'blue'},
                                          'number_of_buttons': 'one'});
  },
  
  // shelby.alert mimicks js native confirm functionality.
  // optional: add a callback function to execute after confirm choice is executed
  confirm: function(message, button_one_opts, button_two_opts, callback){
    shelby.models.notificationState.bind('change:response', function(r){
      if (callback) { callback( r.get('response') ); }
      r.unbind('change:response');
    });
    
    button_one_options = $.extend({visible: true}, button_one_opts);
    button_two_options = $.extend({visible: true}, button_two_opts);
    shelby.models.notificationState.set({ 'message': message,
                                          'number_of_buttons': 'two',
                                          'button_one' : button_one_options,
                                          'button_two' : button_two_options,
                                          'visible': true});
  }

});