libs.shelbyGT.Ajax = {
  // default error handling for ajax calls in the Shelby app
  defaultOnError : function(event, jqXHR, ajaxSettings, thrownError){
    if(!shelby.views.notificationOverlayView){ new libs.shelbyGT.notificationOverlayView({model:shelby.models.notificationState}); }
    switch(jqXHR.status){
      case 401:
        shelby.dialog(
          {
            message: "<p>You are not authorized to do that</p>",
            button_primary : {
              title: 'Login'
            },
            button_secondary : {
              title: 'No thanks'
            }
          },
          function(returnValue){
            if(returnValue == libs.shelbyGT.notificationStateModel.ReturnValueButtonPrimary) {
              document.location = "/";
            }
          }
        );
        break;
      case 403:
        shelby.alert({message: "<p>You are not authorized to do that</p>"});
        break;
    }
  },

  validAnonUrlStubs : [
    shelby.config.apiRoot+'/user',
    shelby.config.apiRoot+'/roll/',
    shelby.config.apiRoot+'/frame/',
    shelby.config.apiRoot+'/POST/gt_interest',
    '/short_link',
    '/watched',
    shelby.config.apiRoot+'/video/search',
    '/fix_if_necessary',
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
