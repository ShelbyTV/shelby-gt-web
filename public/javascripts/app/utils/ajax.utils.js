libs.shelbyGT.Ajax = {
  // default error handling for ajax calls in the Shelby app
  defaultOnError : function(event, jqXHR, ajaxSettings, thrownError){
    if (jqXHR.status == 401) {
      // TODO: authenticate and redirect
      alert("You're not authenticated with the Shelby API, we should redirect and authenticate you.");
    } else {
      // TODO: nicer looking notification of generic error message
      alert("Something went wrong. Shelby apologizes.");
    }
  },
 };