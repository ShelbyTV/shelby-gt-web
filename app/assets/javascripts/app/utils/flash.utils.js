libs.utils.flash = {
  detectFlash : function() {
    var flashVersion = swfobject.getFlashPlayerVersion();
    if ( flashVersion.major == 0 && !Browser.isIpad() ) {
      if(cookies.get('flash_declined') != "true") {
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
  }
};