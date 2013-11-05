//load event tracking js
//= require ./event-tracking/landing.tracking.js
//= require ./app/browser.js
//= require ./app/utils/oauth_popup.js
//= require ./app/config/user.config.js
//= require ./app/utils/cookies.js
//= require ./backbone/underscore.js
//= require ./signup/user-update
//= require ./modules/twilio-appstore.js

$(document).ready(function(e){
  var listenScroll = true,
      scroll = function(e,direction){
        // scrolling is hinged on the slideshow dots.
        var currentIndex = $nav.children('.list__item--selected').index();

        // NOOP at head and tail, keep listening for scroll events.
        if(direction == 'previousSlide' && currentIndex < 1 || direction == 'nextSlide' &&  currentIndex >= $nav.children().length - 1) {
          listenScroll = true;
          return;
        }

        $nav.children().eq(direction == 'previousSlide' ? currentIndex - 1 : currentIndex + 1).children('a').trigger('click');
      };

  /*
    This isn't sexy but whatever:
    Determine if touch device (tablet, really)

    Only do touchy stuff if Modernizr says to.
  */
  if( Modernizr.touch && Browser.isIos() ){
    /*------------------------------------------------------------------------*/
    /*  Credit: Eike Send for the awesome swipe event                         */
    /*  via:    https://github.com/peachananr/onepage-scroll/                 */
    /*------------------------------------------------------------------------*/
    $.fn.swipeEvents = function() {
      return this.each(function() {

        var startX,
            startY,
            $this = $(this);

        $this.bind('touchstart', touchstart);

        function touchstart(event) {
          var touches = event.originalEvent.touches;
          if (touches && touches.length) {
            startX = touches[0].pageX;
            startY = touches[0].pageY;
            $this.bind('touchmove', touchmove);
          }
          event.preventDefault();
        }

        function touchmove(event) {
          var touches = event.originalEvent.touches;
          if (touches && touches.length) {
            var deltaX = startX - touches[0].pageX;
            var deltaY = startY - touches[0].pageY;

            if (deltaX >= 50) {
              $this.trigger("swipeLeft");
            }
            if (deltaX <= -50) {
              $this.trigger("swipeRight");
            }
            if (deltaY >= 50) {
              $this.trigger("swipeUp");
            }
            if (deltaY <= -50) {
              $this.trigger("swipeDown");
            }
            if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
              $this.unbind('touchmove', touchmove);
            }
          }
          event.preventDefault();
        }

      });
    };

    $(this)
      .swipeEvents()
      .on('swipeDown',function(e){
        scroll(e,'previousSlide');
      })
      .on('swipeUp',function(e){
        scroll(e,'nextSlide');
      });
  } else {
    $(this).on('mousewheel DOMMouseScroll MozMousePixelScroll',function(e){
      var direction;
      // for firefox
      if(e.originalEvent.type == "MozMousePixelScroll" && listenScroll && (e.originalEvent.detail > 50 || e.originalEvent.detail < -50)) {
        listenScroll = false;
        direction = (e.originalEvent.detail < 0 ? 'previousSlide' : 'nextSlide');
        scroll(e,direction);
      }
      // for non-firefox
      else if(listenScroll && (e.originalEvent.wheelDelta > 50 || e.originalEvent.wheelDelta < -50)) {
        listenScroll = false;
        direction = (e.originalEvent.wheelDelta > 0 ? 'previousSlide' : 'nextSlide');
        scroll(e,direction);
      }
    });
  }

  $(this).on('slideChanged', function(e){
      listenScroll = true;
  });

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
      $target           = $('.js-target'),
      $horizontalIphone = $('.js-horz-iphone'),
      $nav              = $('.js-slide-navigator'),
      isHorizontal      = false;


  /*
    Set shelf height to fill window, minus header.
  */
  if( !$doc.hasClass('shelby--mobile') || Browser.isIpad() ){
    var windowHeight = window.innerHeight - $('.js-header').height(),
        shelf = {
          $cta    : $('#intro').height(windowHeight - 50),
          $iphone : $('#iphone').height(windowHeight),
          $social : $('#social').height(windowHeight),
          $stream : $('#stream').height(windowHeight - 50),
          $press  : $('#press').height(windowHeight),
          $footer : $('#footer').addClass('animate_module') //add class dynamically, or you get weird ghosting effect.
        };

    var FANCY = {
      // offset by the height of the header.
      _headerHeight : 65,

      // jQuery.animate specific configuration/defaults
      config : {
        _activeClass : 'list__item--selected', // className to indicate active slide of carousel.

        settings : {
          scrollTop : 0,
        },
        speed    : 800,
        callback : function(data){
          $.event.trigger('slideChanged',data);

          // offset by index of shelf__wrapper--cta (that's the first slide);
          var index = data.$target.index();

          $nav.children().removeClass(this._activeClass).eq(index).addClass(this._activeClass);
        }
      },

      beforeChange : function($target) {
        $.event.trigger('beforeChange', $target);
      },

      autoScroll : function($target,$prevTarget){
        var destination = $target.offset().top - this._headerHeight;

        this.config.settings.scrollTop = destination;

        /*
          scrolltop is the most important piece of information.
          $target and $prevTarget are datapoints that let you know what's going on.
        */
        var data = {
          scrollTop   : destination,
          $prevTarget : $prevTarget,
          $target     : $target
        };

        /*
          bind an element to the "beforeChange" event for immediate handling.
          otherwise, use the animate callback event, "slideChanged"
        */
        this.beforeChange(data);

        var self = this;

        $doc.animate(this.config.settings,this.config.speed,function(){ self.config.callback(data); });
      }
    };

    $iphone.on('beforeChange',function(e,data){
      switch(data.$target[0]) {
        case shelf.$cta[0] :
        case shelf.$stream[0] :
          $.event.trigger('isHorizontal',true);
          $(this).toggleClass('iphone--horizontal',false);
        break;
        case shelf.$social[0] :
          $(this).toggleClass('iphone--horizontal',true);
        break;
      }
    }).on('transitionend', function(e){
      $.event.trigger('isHorizontal',false);
    }).on('slideChanged',function(e,data){
      var $this = $(this);
      switch(data.$target[0]) {
        case shelf.$cta[0] :
        case shelf.$stream[0] :
          $(this).removeAttr('style');
        break;
        case shelf.$social[0] :
          $(this).offset({ top: $iphoneSouth.offset().top - 11 });
        break;
      }

    });

    $iphoneSouth.on('beforeChange',function(e,data){
      //hide iphone if direction is either going-to, or, coming-from press.
      if((data.$target[0] != shelf.$press[0] && data.$prevTarget[0] != shelf.$press[0])) {
        $(this).addClass('cloaked');
      }
    }).on('slideChanged',function(e,data){
      //if coming from stream
      var $this = $(this);

      switch(data.$prevTarget[0]){
        case shelf.$stream[0] :
          $this.removeClass('cloaked');
          setTimeout(function(){
            $this.children('.iphone__viewport').children('.slide').toggleClass('show',true);
          },2000);
          break;
        case shelf.$cta[0] :
        case shelf.$social[0] :
            $this.children('.iphone__viewport').children('.slide').toggleClass('show',false);
        break;
      }
    });

    $iphoneViewport.on('beforeChange', function(e,data){
      var $this = $(this);

      switch(data.$target[0]) {
        case shelf.$cta[0] :
          $(this).children().toggleClass('show',false);
        break;
        case shelf.$stream[0] :
          $(this).children().eq(1).toggleClass('show--hover',false);
          $(this).children().eq(0).toggleClass('show',true);

          setTimeout(function(){
            $this.children().eq(1).toggleClass('show--hover',true);
          },2000);
        break;
      }
    });

    shelf.$iphone.on('slideChanged',function(e,data){
      switch(data.$target[0]) {
        case shelf.$cta[0]:
          $(this).show();
          break;
      }
    });

    shelf.$footer.on('slideChanged',function(e,data){
      var $this = $(this);

      switch(data.$target[0]) {
        case shelf.$stream[0] :
        case shelf.$cta :
          $this.toggleClass('peak',false);
          shelf.$footer.toggleClass('peak show',false);
          break;
        case shelf.$social[0] :
          $this.toggleClass('peak',true);
          break;
      }

    });

    $footerButton.on('click',function(e){
      if( !$(e.target).is('a') ) {
        e.preventDefault();
      }
      shelf.$footer.toggleClass('show').find('.icon').toggleClass('icon-arrow_up icon-arrow_down');
    });

    $nav.on('click','.js-scrollto',function(e){
      e.preventDefault();
      /*
        Grab the #name of the link clicked, parse it, then scroll to it.
        Pass the target element along.
      */
      var $target = $(this.hash),
          currentActive = $(this).parent().hasClass('.list__item--selected') ? $target : $(this).parent().siblings('.list__item--selected').children('a')[0].hash;
          $prevTarget = $(currentActive);

      $target = $target.length ? $target : $('[name=' + this.hash.slice(1) +']');
      FANCY.autoScroll($target,$prevTarget);
    });

    /*
      because of z-indexing the user can't directly interact with the fixed iphone.
      there is a .iphone.cloaked for the necessary shelves that the user actually interacts with.
      hence, phantom hovering.
    */
    $('.js-phantom-hover').on('mouseenter', function(){
      $iphoneViewport.children().eq(1).toggleClass('show--hover',false);
    }).on('mouseleave',function(){
      $iphoneViewport.children().eq(1).toggleClass('show--hover',true);
    });
  }
});