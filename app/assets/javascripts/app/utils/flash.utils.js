libs.utils.flash = {
  flashVersion : swfobject.getFlashPlayerVersion(),

  browserHasFlash : function() {
    return this.flashVersion.major > 0;
  },

  flashDeclined : function() {
    return cookies.get('flash_declined') == "true";
  },

  h264Support : function() {
    return !Browser.isFirefox();
  },

  noFlashno264Support : function() {
    return !this.h264Support() && !this.browserHasFlash();
  },

  detectFlash : function() {
    if(!this.browserHasFlash() && !Browser.isIpad()){
      if(!this.flashDeclined()) {
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
  }
};