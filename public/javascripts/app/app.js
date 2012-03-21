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
    apiRoot : 'http://localhost:3000/v1'//'http://api.gt.shelby.tv/v1'
  },
	
	// Signed in convience function
	userSignedIn: function(){
		return cookies.get("locked_and_loaded") == "true" ? true : false;
	}
};

//---------------------------------------------------------
// setup ajax defaults
//---------------------------------------------------------
$.ajaxSetup({
  xhrFields: {withCredentials: true},
  data: {'cs_key': 'GoatsFTW'}
});

$(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError){
  if (jqXHR.status == 401) {
		console.log("You're not authenticated with the Shelby API, we should redirect and authenticate you.");
  } else {
		console.log("Something went wrong. Shelby apologizes.", jqXHR.status);
  }
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
		shelby.router = new AppRouter();
	  Backbone.history.start({ pushState:true });
  }
});
