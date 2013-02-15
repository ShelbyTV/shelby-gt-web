libs.utils.flash = {
  flashVersion : function() {
    console.log('browser flash version');
    return swfobject.getFlashPlayerVersion()
  },

  browserHasFlash : function() {
    console.log('browser has flash, and browser is not an ipad');
    return (this.flashVersion.major > 0) && !Browser.isIpad()
  },

  flashDeclined : function() {
    console.log('user declined notification');
    return cookies.get('flash_declined') != "true"
  },

  h264Support : function() {
    console.log('browser does not support h264');
    return !Browser.isFirefox() || !Browser.isOpera();
  },

  html5no264Support : function() {
    console.log('browser does not have flash, browser does not support h264')
    return !this.h264Support() && !this.browserHasFlash();
  },

  detectFlash : function() {
    console.log('detect flash');
    if ( !this.browserHasFlash() && !this.flashDeclined() ) {
    console.log('browser does not have flash and user has not declined notification');
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
          cookies.set('flash_declined','true',90);
        }
      });
    }
  }
};