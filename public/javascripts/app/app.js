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
shelby = {
  models : {},
  views : {},
  config : {
    apiRoot : 'http://api.gt.shelby.tv/v1'
  },

  // Signed in convience function
  userSignedIn: function(){
		var _cookie = cookies.get("_shelby_gt_common");
		return _cookie.split("=").length == 2 ? _cookie.split("=")[1] !== "nil" ? true : false : false;
  },
	
	signOut: function(){
		document.location.href = "http://api.gt.shelby.tv/sign_out_user";
	}

};

//---------------------------------------------------------
// setup ajax defaults
//---------------------------------------------------------
$.ajaxSetup({
  xhrFields: {withCredentials: true},
  data: {'cs_key': 'GoatsFTW'}
});
$.ajaxPrefilter(function(options, originalOptions, xhr) {
  //block POST, PUT, DEL requests for anon users
  if (shelby.models.user.get('anon') && !libs.shelbyGT.Ajax.isAnonUrlValid(options)){
    shelby.views.anonBanner.displayOverlay();
    xhr.abort();
  }
  // attach the API's csrf token to the request for logged in users
  if (options.type != 'GET' && shelby.models.user) {
    var token = shelby.models.user.get('csrf_token');
    if (token) xhr.setRequestHeader('X-CSRF-Token', token);
  }
});

// global ajax error handling to handle users who are not authenticated and other unexpected errors
// disable for more specific error handling by using the jQuery.ajax global:false option
$(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError){
  libs.shelbyGT.Ajax.defaultOnError(event, jqXHR, ajaxSettings, thrownError);
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
