libs.shelbyGT.Ajax = {
  // default error handling for ajax calls in the Shelby app
  defaultOnError : function(event, jqXHR, ajaxSettings, thrownError){
    if(!shelby.views.notificationOverlayView){ new libs.shelbyGT.notificationOverlayView({model:shelby.models.notificationState}); }
    switch(jqXHR.status){
      case 401:
        shelby.alert("Sorry, but you need you to sign in again.  You will now be brought to the login page.", function(){
          document.location = "/signout?error=401";
        });
        break;
      case 403:
        shelby.alert("You are not authorized to do that");
        break;
    }
  },
  
  validAnonUrlStubs : [
    shelby.config.apiRoot+'/user/',
    shelby.config.apiRoot+'/roll/',
    '/short_link'
  ],
  
  isAnonUrlValid : function(opts){
    var valid = false;
    if (opts.type != 'GET') return valid;
    this.validAnonUrlStubs.forEach(function(stub){
      //for each of the valid stubs
      if (opts.url.indexOf(stub)!==-1){
        //if url contains the valid stub
        valid = true;
        //mark as valid
      }
    });
    //by default return invalid
    return valid;
  }
};
