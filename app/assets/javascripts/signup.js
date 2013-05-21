// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

//= require ./jquery-plugins/jquery.cycle.js

var NEXT = true;

var onBefore = function(foo,bar,baz){
  // console.log('onBefore',this);
  var $index = $(this).data('index');
  // $('.js-next').attr('disabled',($index >= 4));
};

var onAfter = function(foo,bar,baz){
  // console.log('onAfter',this);
  var $index = $(this).data('index');

  window.location.hash = ($index);

  // console.log($index, ($index >= 4));
};

var startingSlide = function() {
  var num = +(window.location.hash.split('#')[1]);
  return (!isNaN(num) && num >= 0) ? num : 0;
};

(function(){

  $slideshow = $('.js-slideshow');


  $slideshow.cycle({
    after         : onAfter,
    before        : onBefore,
    fx            :   'scrollLeft',
    next          : '.js-advance-slideshow',
    nowrap        : true,
    timeout       : 0,
    speed         : 500,
    startingSlide : startingSlide()
  });

  var $followUnfollow = $('.js-followOrUnfollow').data('follow',false);

  $followUnfollow.on('click',function(e){
    e.preventDefault();

    var $this = $(this);

    $this.toggleClass('button_gray',!$this.hasClass('button_gray'));
    $this.toggleClass('button_green',!$this.hasClass('button_gray'));

  });

  $(window).on('hashchange',function(e){
    e.preventDefault();
    $slideshow.cycle(+(window.location.hash.split('#')[1]));
  });

})();