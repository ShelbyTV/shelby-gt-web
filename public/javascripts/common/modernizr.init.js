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
  //opera returns the "opera" object,
  //exploiting this because Opera's SVG background support is shaky,
  //so, load the png fallback css and enable the proper class.
  if(window.opera){
    $('html').removeClass('svg').addClass('no-svg')
             .children('head').append('<link href="/stylesheets/png.css" media="screen" rel="stylesheet" type="text/css"/>');
  }
});
