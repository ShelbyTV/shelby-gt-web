$(function(){
  //if touch-screen enabled, use iscroll
  if(Modernizr.touch){
    
    var guide = document.getElementById('guide');
    if(guide != null){
      var scroll = new iScroll('js-guide-wrapper');
      var refresh = function(e){
        setTimeout(function(){
            scroll.refresh();
        },0);
      }
      guide.addEventListener('DOMSubtreeModified', refresh, false);
    }
  }

  //if browser does NOT support SVG
  if(!Modernizr.svg){
    console.log('svg not supported');
  }
});