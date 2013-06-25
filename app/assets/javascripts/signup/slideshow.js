if (signupStep == 1) {
  //the functions below are used inside the config for $slideshow.cycle();
  var onAfter = function(curr,next,opts,d){
    window.location.hash = opts.currSlide;

    var lastSlide = opts.currSlide == (opts.slideCount - 1);

    $('.js-next').toggleClass('hidden',lastSlide);
    $('.js-advance-slideshow').toggleClass('hidden', !lastSlide);

    $('.js-slideshow-menu').children('.list__item').removeClass('list__item--selected').eq(opts.currSlide).addClass('list__item--selected');

    // track click event
    shelby.trackEx({
      providers : ['ga', 'kmq'],
      gaCategory : "Onboarding",
      gaAction : 'Click More on Step 1',
      kmqName : "Click More on Step 1 in Onboarding"
    });
  };

  var startingSlide = function() {
    //get current slide from hash
    var currentSlide = +(window.location.hash.split('#')[1]);
    return (!isNaN(currentSlide) && currentSlide >= 0) ? currentSlide : 0;
  };

  $(document).ready(function(){

    // track start of signup process
    shelby.trackEx({
      providers : ['ga', 'kmq'],
      gaCategory : "Onboarding",
      gaAction : 'Started',
      kmqName : "Started Onboarding"
    });

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
      //doesn't need logic anymore, checkbox isn't hidden
    });

    var $followAll = $('.js-follow-all');

    $followAll.on('click', function(e){

      var category = e.currentTarget.id.split(':')[1];
      var $isChecked = $(e.currentTarget).is(':checked');
      var $checkboxes = $('.js-' + category).find('.form_checkbox');

      $checkboxes.attr('checked',$isChecked);
    });

    $(window).on('hashchange',function(e){
      e.preventDefault();

      $slideshow.cycle(+(window.location.hash.split('#')[1]));
    });

    // if the user failed to follow the appropriate number of rolls
    // on their previous attempt, let them know
    if (!followValidationOk) {
      alert("To make Shelby better for you, pick at least one source of video");
    }
  });
}