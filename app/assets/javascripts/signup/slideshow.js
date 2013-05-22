//the functions below are used inside the config for $slideshow.cycle();
var onAfter = function(curr,next,opts,d){
  window.location.hash = opts.currSlide;

  var lastSlide = opts.currSlide == (opts.slideCount - 1);

  $('.js-next').toggleClass('hidden',lastSlide);
  $('.js-advance-slideshow').toggleClass('hidden', !lastSlide);
};

var startingSlide = function() {
  //get current slide from hash, makes things linkable?
  var currentSlide = +(window.location.hash.split('#')[1]);
  return (!isNaN(currentSlide) && currentSlide >= 0) ? currentSlide : 0;
};

(function(){

  $slideshow = $('.js-slideshow');

  $slideshow.cycle({
    after         : onAfter,
    fx            : 'scrollHorz',
    next          : '.js-next',
    nowrap        : true,
    manualTrump   : false,
    pager         : '.js-pagination',
    timeout       : 0,
    speed         : 500,
    startingSlide : startingSlide()
  });

  var $followUnfollow = $('.js-followOrUnfollow');

  $followUnfollow.on('click',function(e){
    e.preventDefault();

    var $this = $(this),
        roll_id = $this. data('roll_id'),
        isFollowing = !$this.hasClass('button_gray'); // button_gray == not following

      //naively toggle state & text of button
      $this.toggleClass('button_green button_gray')
           .text(isFollowing ? 'Follow' : 'Following');

      //change value of hidden input associated with button
      $('#rolls_' + roll_id).attr('checked', !isFollowing);
  });

  $(window).on('hashchange',function(e){
    e.preventDefault();

    $slideshow.cycle(+(window.location.hash.split('#')[1]));
  });
})();