//---------------------------------------------------------
// global mechanism for including library prototypes
//---------------------------------------------------------
libs = {
  shelbyGT : {},
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
		document.location.href = "/sign_out";
	},
	
	alert: function(message, callback){
		shelby.models.notificationState.bind('change:response', function(r){
			if (callback) { callback( r.get('response') ); }
			r.unbind('change:response');
		});
		shelby.models.notificationState.set({	'message': message, 
																					'visible': true,
																					'button_one' : {visible: true, text: "Ok", color: 'blue'},
																					'number_of_buttons': 'one'});
	},
	
	confirm: function(message, button_one_opts, button_two_opts, callback){
		shelby.models.notificationState.bind('change:response', function(r){
			if (callback) { callback( r.get('response') ); }
			r.unbind('change:response');
		});
		
		button_one_options = $.extend({visible: true}, button_one_opts);
		button_two_options = $.extend({visible: true}, button_two_opts);
		shelby.models.notificationState.set({	'message': message,
																					'number_of_buttons': 'two',
																					'button_one' : button_one_options,
																					'button_two' : button_two_options,
																					'visible': true});
	}

});

//---------------------------------------------------------
// setup ajax defaults
//---------------------------------------------------------
$.ajaxSetup({
  xhrFields: {withCredentials: true}
});
$.ajaxPrefilter(function(options, originalOptions, xhr) {
  //block POST, PUT, DEL requests for anon users
  if (shelby.models.user.get('anon') && !libs.shelbyGT.Ajax.isAnonUrlValid(options)){
    //shelby.views.anonBanner.displayOverlay();
    xhr.abort();
  }
  // attach the API's csrf token to the request for logged in users
  if (options.type != 'GET' && shelby.models.user && !options.no_csrf) {
    var token = $('meta[name=csrf-token]').attr('content');
    if (token) xhr.setRequestHeader('X-CSRF-Token', token);
  }
});

// global ajax error handling to handle users who are not authenticated and other unexpected errors
// disable for more specific error handling by using the jQuery.ajax global:false option
$(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError){
  var exec = ajaxSettings.error || libs.shelbyGT.defaultOnError;
  exec(event, jqXHR, ajaxSettings, thrownError);
  /*if (ajaxSettings.error) { //we should allow overrides
    ajaxSettings.error(event, jqXH);
  } else {
    libs.shelbyGT.Ajax.defaultOnError(event, jqXHR, ajaxSettings, thrownError);
  }*/
});

//---------------------------------------------------------
// Load App Router and start history if logged in
//---------------------------------------------------------
$(document).ready(function(){
  /*
    If on splash page don't want to try and hit api for data, will just get 401.
    If trying to watch a public roll, want to show whether logged in or not.
  */
  /* not on splash page, could be logged in or not */
  //TODO: the 'non-logged-in-user' functionality needs to built out
  shelby.router = new libs.shelbyGT.AppRouter();
  Backbone.history.start({ pushState:true });
  
  shelby.userInactivity.init();
});
