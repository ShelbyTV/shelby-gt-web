//---------------------------------------------------------
// setup ajax defaults
//---------------------------------------------------------
$.ajaxSetup({
  xhrFields: {withCredentials: true}
});
$.ajaxPrefilter(function(options, originalOptions, xhr) {
  //block POST, PUT, DEL requests for anon users
  if (shelby.models.user.get('anon') && !libs.shelbyGT.Ajax.isAnonUrlValid(options)){
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
  libs.shelbyGT.Ajax.defaultOnError(event, jqXHR, ajaxSettings, thrownError);
  if (ajaxSettings.error) {ajaxSettings.error(event, jqXHR, ajaxSettings, thrownError);}
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
