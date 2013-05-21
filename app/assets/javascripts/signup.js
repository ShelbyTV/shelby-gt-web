// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

//= require ./jquery-plugins/jquery.cycle.js

//on step 4 post array save to a hidden input tag

var onBefore = function(curr,next,opts,d){
};

var onAfter = function(curr,next,opts,d){
  window.location.hash = opts.currSlide;

  $('.js-next').toggleClass('hidden',(opts.currSlide > 3));
  $('.js-advance-slideshow').toggleClass('hidden', !(opts.currSlide > 3));
};

var startingSlide = function() {
  //get current slide from hash, makes things linkable?
  var slide = +(window.location.hash.split('#')[1]);
  return (!isNaN(slide) && slide >= 0) ? slide : 0;
};

(function(){

  $slideshow = $('.js-slideshow');

  $slideshow.cycle({
    after         : onAfter,
    before        : onBefore,
    fx            : 'scrollHorz',
    next          : '.js-next',
    nowrap        : true,
    timeout       : 0,
    speed         : 500,
    startingSlide : startingSlide()
  });

  var $followUnfollow = $('.js-followOrUnfollow');

  $followUnfollow.on('click',function(e){
    e.preventDefault();

    var $this = $(this),
        roll_id = $this.data('roll_id'),
        isFollowing = !$this.hasClass('button_gray'); // button_gray == not following

      //naively toggle state & text of button
      $this.toggleClass('button_green button_gray')
           .text(isFollowing ? 'Follow' : 'Following');

      //change value of hidden input associated with button
      $('#roll_' + roll_id).val(!isFollowing);
  });

  $(window).on('hashchange',function(e){
    e.preventDefault();

    $slideshow.cycle(+(window.location.hash.split('#')[1]));
  });
})();
