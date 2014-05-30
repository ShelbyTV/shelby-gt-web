//load event tracking js
//= require ./event-tracking/landing.tracking.js
//= require ./app/browser.js
//= require ./app/utils/oauth_popup.js
//= require ./app/config/user.config.js
//= require ./app/utils/cookies.js
//= require ./backbone/underscore.js
//= require ./signup/user-update

$(document).ready(function(e){
  /*
    This isn't sexy but whatever:
    Determine if touch device (tablet, really)

    Only do touchy stuff if Modernizr says to.
  */
  if( !Modernizr.touch ){
    $('.js-log_in').on('click', function(e) { e.preventDefault(); });
  }

  if( Modernizr.touch && Browser.isTablet() && !$('body').hasClass('shelby--team') && !$('body').hasClass('shelby--seovideo') ){
    /*------------------------------------------------------------------------*/
    /*  Credit: Eike Send for the awesome swipe event                         */
    /*  via:    https://github.com/peachananr/onepage-scroll/                 */
    /*------------------------------------------------------------------------*/
  } else {
  }


  try {
    _gaq.push(['_trackEvent', 'Landing Page', 'Visit']);
  } catch(e) {}

  // cache objects that need handling!
  var $doc              = $('html,body'),
      $footerButton     = $('.js-toggle-footer'),
      $header           = $('.js-header'),
      $iphone           = $('.js-iphone'),
      $iphoneSouth      = $('.js-iphone-south'),
      $iphoneViewport   = $iphone.find('.js-iphone-viewport'),
      $loginButton      = $('.js-dropdown_module'),
      $target           = $('.js-target'),
      $horizontalIphone = $('.js-horz-iphone'),
      $nav              = $('.js-slide-navigator'),
      isHorizontal      = false;

  $('.js-get-started-button,#login-submit-android').on('click', function(e){
    e.preventDefault();
    var $target = $(e.currentTarget);
    if (!$target.hasClass('button_busy')) {
      $target.addClass('button_busy');
      window.setTimeout(function(){
        $(e.currentTarget.form).submit();
      }, 500);
    }
  });

  $('.js-login-oauth:not(.js-authorize)').on('click', function(e){
    var self = this;

    // click on oauth redirector link button, put a spinner on the button
    e.preventDefault();
    var $target = $(e.currentTarget);
    if (!$target.hasClass('button_busy')) {
      $target.addClass('button_busy');
      window.setTimeout(function(){
        window.location = $(self).attr('href');
      }, 100);
    }
  });

  /*
    Set shelf height to fill window, minus header.
  */
  if( !$doc.hasClass('shelby--mobile') || Browser.isIpad() ){
    var windowHeight = window.innerHeight - $('.js-header').height(),
        shelf = {
          $cta    : $('#cta').height(windowHeight - 50),
          $export : $('#export').height(windowHeight - 200),
          $iphone : $('#iphone').height(windowHeight),
          $social : $('#social').height(windowHeight),
          $stream : $('#stream').height(windowHeight - 50),
          $press  : $('#press').height(windowHeight),
          $apps   : $('#apps').height(windowHeight - 200),
          $footer : $('#footer') //add class dynamically, or you get weird ghosting effect.
        };

    if(Modernizr.touch) {
      $(this).on('touchmove',function(){
        $('.dropdown_section').hide().find('input').blur();
      });

      $loginButton.removeClass('dropdown_module').css('position','relative').children('.dropdown_button').on('touchstart',function(e){
        $(this).siblings('.dropdown_section').toggle();
        if($('.dropdown_section').is(':visible')) {
          $('#username').focus();
        } else {
          $('#username').blur();
        }
      });
    }
  }
});
