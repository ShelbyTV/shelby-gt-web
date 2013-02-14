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

  //don't decode the fragment in the Backbone.queryparams plugin because backbone 0.9.1 already does it
  Backbone.Router.decodeFragment = false;
  shelby.router = new libs.shelbyGT.AppRouter();
  //if the browser doesn't support push state, user a different root url
  //for the route that handles such browsers
  var historyOptions = {pushState: true};
  if (!Browser.hasPushState()) {
    historyOptions.root = '/hash_app';
  }
  Backbone.history.start(historyOptions);

  if(!Browser.isMobile()){
    shelby.userInactivity.init();
  }

  var flashVersion = swfobject.getFlashPlayerVersion();
  console.log('app.start',flashVersion);
  if ( flashVersion.major == 0 ) {
  console.log('flash is non-existent');
    if(cookies.get('flash_declined') != "true") {
  console.log('flash_declined is not set to true');
      shelby.dialog({
        message: SHELBYJST['alert_no-flash'](),
        button_primary : {
          title: 'Install Flash Now'
        },
        button_secondary : {
          title: 'No thanks'
        }
      },function(returnVal){
        if(returnVal == libs.shelbyGT.notificationStateModel.ReturnValueButtonPrimary){
          window.open('http://get.adobe.com/flashplayer/','_blank');
        } else {
          console.log('dismiss this alert "forever"');
          cookies.set('flash_declined','true',90);
        }
      });
    }
  }

});
