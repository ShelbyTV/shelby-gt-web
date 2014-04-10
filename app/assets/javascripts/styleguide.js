//= require ./jquery-plugins/jquery.indexChar

$(function(){
  $('.js-line-clamp').on('click',function(){
    $(this).toggleClass('line-clamp--open');
  });

  var $list           = $('.js-videocard-annotations'),
      annotationClass = '.css-tag',
      visuallyhidden  = 'visuallyhidden';

  $list.children().addClass(visuallyhidden);

  $('#_videocard').on('mouseenter',annotationClass,function(e){
    var signature = $.indexChar(this.getAttribute('data-note'));
    $list.children().eq(signature).removeClass(visuallyhidden);
  }).on('mouseleave',annotationClass,function(e){
    var signature = $.indexChar(this.getAttribute('data-note'));
    $list.children().eq(signature).addClass(visuallyhidden);
  });

});
