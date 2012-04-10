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
    if (cookies.get("signed_in") == "true"){ signedIn = true; }
    else {
      // HACK to get around cross domain cookie issues. we dont have the 'signed_in' cookie
      //   from api.gt.shelby.tv so we are just hitting up /signed_in to see if we get true or false
      if (window.document.location.hostname == "localhost" || window.document.location.hostname == "33.33.33.10"){
        $.get(this.config.apiRoot + '/signed_in?cs_key=GoatsFTW', function(r){
          if (r.result.signed_in === true){
            cookies.set("signed_in", "true");
            signedIn = true;
            document.location.reload();
          }
          else {
            cookies.set("signed_in", "false");
            signedIn = false;
          }
        });
      }
      else { signedIn = false; }
      // end HACK
    }
    // signedIn = cookies.get("signed_in") == "true" ? true : false
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
$.ajaxPrefilter(function(options, originalOptions, xhr) {
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
});
