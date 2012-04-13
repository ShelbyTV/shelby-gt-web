libs.shelbyGT.Ajax = {
  // default error handling for ajax calls in the Shelby app
  defaultOnError : function(event, jqXHR, ajaxSettings, thrownError){
    if (jqXHR.status == 401) {
      // TODO: authenticate and redirect
			$('#temp-signin').show();
      console.error("You're not authenticated with the Shelby API, we should redirect and authenticate you.");
    } else {
      // TODO: nicer looking notification of generic error message
      console.error("Something went wrong. Shelby apologizes.");
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
