/**
	oAuth via popup window
**/
$("a.auth-popup, button.js-oauth-popup").live('click', function(e){
 	if( Browser.supportsAuthPopup() && !Browser.isIframe()){
		var width = $(this).attr('popup-width');
		var height = $(this).attr('popup-height');
		var left = (screen.width/2)-(width/2);
		var top = (screen.height/2)-(height/2);
				
		if (typeof $(this).attr('location') !== 'undefined'){
			$(this).attr("href", $(this).attr('location'));
		}
    
    window.open($(this).attr("href"), "authPopup", "menubar=no,toolbar=no,status=no,width="+width+",height="+height+",toolbar=no,left="+left+",top="+top);
		
		e.stopPropagation(); return false;
	}
});

/**
	signup via popup window
**/
$("a.signup-popup").live('click', function(e){
  if( Browser.supportsAuthPopup() ){
		var width = $(this).attr('popup-width');
		var height = $(this).attr('popup-height');
		var left = (screen.width/2)-(width/2);
		var top = (screen.height/2)-(height/2);
				
		if (typeof $(this).attr('location') !== 'undefined'){
			$(this).attr("href", $(this).attr('location'));
		}
		
    window.authPopup = window.open($(this).attr("href"), "authPopup", "menubar=no,toolbar=no,status=no,width="+width+",height="+height+",toolbar=no,left="+left+",top="+top);
    
    // ******************************************
		// Communication between window and popup
		function reloadPageFunction(event){
		  if (event.data == "complete"){
        document.location.href = document.location.href;
        event.source.postMessage("close", event.origin);		    
		  }
    }
		
		// communication cant start right away for some reason. 
		// TODO: look into this.
    setInterval(function(v){
      window.authPopup.postMessage("opened", shelby.config.secure.apiBase);
    }, 1000);
    window.addEventListener("message", reloadPageFunction, false);
  	// ******************************************
   
 		e.stopPropagation(); return false; 
  }
});