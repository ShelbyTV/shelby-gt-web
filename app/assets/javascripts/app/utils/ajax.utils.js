libs.shelbyGT.Ajax = {
  // default error handling for ajax calls in the Shelby app
  defaultOnError : function(event, jqXHR, ajaxSettings, thrownError){
    if(!shelby.views.notificationOverlayView){ new libs.shelbyGT.notificationOverlayView({model:shelby.models.notificationState}); }
    switch(jqXHR.status){
      case 401:
        //need to log them out immediately so app can't continue to make requests resulting in 401s
        document.location = "/signout?error=401";
        break;
      case 403:
        shelby.alert("You are not authorized to do that");
        break;
    }
  },
  
  validAnonUrlStubs : [
    shelby.config.apiRoot+'/user/',
    shelby.config.apiRoot+'/roll/',
    shelby.config.apiRoot+'/POST/gt_interest',
    '/short_link',
    shelby.config.apiRoot+'/video/search',
    shelby.config.apiRoot+'/js_err'
  ],
  
  isAnonUrlValid : function(opts){
    var valid = false;
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
