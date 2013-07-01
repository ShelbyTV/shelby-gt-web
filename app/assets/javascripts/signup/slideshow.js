if (signupStep == 1) {
  //the functions below are used inside the config for $slideshow.cycle();
  var onAfter = function(curr,next,opts,d){
    window.location.hash = opts.currSlide;

    $('.js-slideshow-menu')
        .children('.list__item').removeClass('list__item--selected')
                                .eq(opts.currSlide)
                                .addClass('list__item--selected');

    // track click event
    shelby.trackEx({
      providers  : ['ga'],
      gaCategory : "Onboarding",
      gaAction   : 'Click Category on Step 1',
      gaLabel    : opts.currSlide
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

    $('.js-advance-step-1').on('click',function(){
      shelby.trackEx({
        providers  : ['ga', 'kmq'],
        gaCategory : "Onboarding",
        gaAction   : 'Click Next Step 1',
        gaValue    : $followUnfollow.children('.form_checkbox:checked').length,
        kmqName    : "Click Next on Step 1"
      });
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
      speed         : 300,
      startingSlide : startingSlide()
    });

    var $followUnfollow = $('.js-followOrUnfollow');

    $followUnfollow.on('click',function(e){
      //doesn't need logic anymore, checkbox isn't hidden
      $this          = $(this),
      category       = $this.data('category');
      categoryLength = $('.js-' + category).find($followUnfollow).length;

      //filter (find) all the checkboxes in the slideshow.
      //then count (filter) the checked ones for the specific category
      var checkedBoxes = $('.js-' + category).find($followUnfollow).children('.form_checkbox')
                                                                   .filter(':checked').length;

      var partiallyChecked = (checkedBoxes > 0 && checkedBoxes < categoryLength);
      var menuItem = $('.js-follow-all-'+category);

      if(partiallyChecked && menuItem.is(':checked')) {
        $('.js-follow-all-'+category).toggleClass('form_checkbox--partial',true);
      } else {
        $('.js-follow-all-'+category).toggleClass('form_checkbox--partial',false);
      }
    });

    var $followAll = $('.js-follow-all');

    $followAll.on('click', function(e){

      var category = e.currentTarget.id.split(':')[1];
      var $isChecked = $(e.currentTarget).is(':checked');
      var $checkboxes = $('.js-' + category).find('.form_checkbox');

      $checkboxes.attr('checked',$isChecked);

      //if not checked, clean up the 'partial' state
      if(!$isChecked) {
        $(this).removeClass('form_checkbox--partial');
      }

    });

    $(window).on('hashchange',function(e){
      e.preventDefault();

      $slideshow.cycle(+(window.location.hash.split('#')[1]));
    });

    // if the user failed to follow the appropriate number of rolls
    // on their previous attempt, let them know
    if (!followValidationOk) {
      alert("To make Shelby better for you, pick at least three source of video");
    }
  });
}