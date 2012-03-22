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
		var signedIn;
		if (cookies.get("locked_and_loaded") == "true"){
			signedIn = true;
		}
		else {
			// HACK to get around cross domain cookie issues. we dont have the 'locked_and_loaded' cookie
			//   from api.gt.shelby.tv so we are just hitting up /signed_in to see if we get true or false
			if (document.location.hostname == "localhost" || document.location.hostname == "33.33.33.10"){
				$.get(this.config.apiRoot + '/signed_in?cs_key=GoatsFTW', function(r){
					if (r.result.signed_in == true){
						cookies.set("locked_and_loaded", "true");
						signedIn = true;
						document.location.reload();
					}
					else {
						cookies.set("locked_and_loaded", "false");
						signedIn = false;
					}
				});
			}
			else { signedIn = false; }
			// end HACK	
		}
		// signedIn = cookies.get("locked_and_loaded") == "true" ? true : false
		return signedIn;
	}
};

//---------------------------------------------------------
// setup ajax defaults
//---------------------------------------------------------
$.ajaxSetup({
  xhrFields: {withCredentials: true},
  data: {'cs_key': 'GoatsFTW'}
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
	if ( !shelby.userSignedIn() && document.location.pathname == '/'){
		/* Not Logged in and on splash page */ 
	}
	else {
		/* not on splash page, could be logged in or not */ 
		//TODO: the 'non-logged-in-user' functionality needs to built out
		if ( !shelby.userSignedIn() ) { 
			console.log("Don't worry, be happy... You just not logged in mon!"); 
			// start logged out experience baby!
		}
	  shelby.router = new libs.shelbyGT.AppRouter();
	  Backbone.history.start({ pushState:true });
  }
});
