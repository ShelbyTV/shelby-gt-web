// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

//= require ./jquery-plugins/jquery.cycle.js

(function(){
  //cool!

  var $slideshow = $('.js-slideshow');

  $slideshow.cycle({
    fx:   'scrollLeft',
    next: '.js-advance-slideshow',
    timeout: 0
  });

  var $followUnfollow = $('.js-followOrUnfollow');

  $followUnfollow.on('click',function(e){
    e.preventDefault();

    var $this = $(this);

    $this.toggleClass('button_gray',!$this.hasClass('button_gray'));
    $this.toggleClass('button_green',!$this.hasClass('button_gray'));
  });

})();