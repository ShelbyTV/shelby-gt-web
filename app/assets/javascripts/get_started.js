//= require jquery
//= require ./jquery-plugins/jquery.urlparams

$(function(){
  $('.js-shelf').height(window.innerHeight);

  $('.js-get-started-button').on('click', function(e){
    e.preventDefault();
    var $target = $(e.currentTarget);
    if (!$target.hasClass('button_busy')) {
      $target.addClass('button_busy');
      window.setTimeout(function(){
        $(e.currentTarget.form).submit();
      }, 500);
    }
  });
});
