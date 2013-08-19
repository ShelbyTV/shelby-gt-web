//progressive enhancement: jquery.fitvid
//= require jquery
//= require_tree ./shares

$(document).ready(function(){
  $('.js-toggle-comment').on('click',function(){
    var $this = $(this);
    $this.toggleClass('line-clamp--open', !$this.hasClass('line-clamp--open'));
  });
});