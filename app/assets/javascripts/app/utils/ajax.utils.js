libs.shelbyGT.Ajax = {
  // default error handling for ajax calls in the Shelby app
  defaultOnError : function(event, jqXHR, ajaxSettings, thrownError){
    if(!shelby.views.notificationOverlayView){ new libs.shelbyGT.notificationOverlayView({model:shelby.models.notificationState}); }
    switch(jqXHR.status){
      case 401:
        shelby.alert("Sorry, but you need you to sign in again.  You will now be brought to the login page.", function(){
          document.location = "/signout?error=401";
        });
      case 403:
        shelby.alert("You are not authorized to do that");
        break;
      default:
        shelby.alert("Something went wrong. Shelby apologizes.");
    }
  },
  
  validAnonUrlStubs : [
    '/user/',
    '/roll/'
  ],
  
  isAnonUrlValid : function(opts){
    var valid = false;
    if (opts.type != 'GET') return valid;
    this.validAnonUrlStubs.forEach(function(stub){
      //for each of the valid stubs
      if (opts.url.indexOf(shelby.config.apiRoot+stub)!==-1){
        //if url contains the valid stub
        valid = true;
        //mark as valid
      }
    });
    //by default return invalid
    return valid;
  }
};
