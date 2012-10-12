$(function(){
  if(Modernizr.touch){
    //if touch-screen enabled, use iscroll
    console.log('iScroll enabled');

    var myScroll;

    function loaded() {
      myScroll = new iScroll('js-guide-body');
    }
    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    document.addEventListener('DOMContentLoaded', function () { setTimeout(loaded, 200); }, false);
  }
});