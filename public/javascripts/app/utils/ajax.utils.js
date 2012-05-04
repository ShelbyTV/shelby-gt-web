libs.shelbyGT.Ajax = {
  // default error handling for ajax calls in the Shelby app
  defaultOnError : function(event, jqXHR, ajaxSettings, thrownError){
    switch(jqXHR.status){
      case 401:
        //user is not authenticated, tried to take action requiring auth
        document.location = "/signout?error=401";
        break;
      case 403:
        //TODO: nicer looking notification of authorization error message
        alert("You are not authorized to do that");
        break;
      default:
        // TODO: nicer looking notification of generic error message
        alert("Something went wrong. Shelby apologizes.");
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
