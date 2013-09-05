/**
  oAuth via popup window
**/
$(function(){
  $('body').on('click','.js-authorize',function(e){

    if($(this).hasClass('disabled')) {
      return false;
    }

    if( Browser.supportsAuthPopup() ){
      var width = $(this).data('popup_width'),
          height = $(this).data('popup_height'),
          left = (screen.width/2)-(width/2),
          top = (screen.height/2)-(height/2);

      window.open($(this).attr("href"), "authPopup", "menubar=no,toolbar=no,status=no,width="+width+",height="+height+",toolbar=no,left="+left+",top="+top);

      return false;
    }
  });
});
