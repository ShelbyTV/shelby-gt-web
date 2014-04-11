//= require ./backbone/underscore
//= require ./backbone/backbone
//= require ./jquery-plugins/jquery.indexChar
//= require ./styleguide/section.view

$(function(){
  $('.js-line-clamp').on('click',function(){
    $(this).toggleClass('line-clamp--open');
  });

  $('.js-annotations').each(function(key,val){
    return new shelby.SectionView({el:val});
  });
});
