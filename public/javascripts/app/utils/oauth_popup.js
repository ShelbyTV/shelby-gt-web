/**
	oAuth via popup window
**/
$("a.auth-popup, button.js-oauth-popup").live('click', function(e){
 	if( Browser.supportsAuthPopup() ){
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