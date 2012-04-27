$(function(){
  //if touch-screen enabled, use iscroll
  if(Modernizr.touch){
    var scroll = new iScroll('js-guide-wrapper');
    var refresh = function(e){
      setTimeout(function(){
          scroll.refresh();
      },0);
    }

    var guide = document.getElementById('guide');
    guide.addEventListener('DOMSubtreeModified', refresh, false);
  }
});