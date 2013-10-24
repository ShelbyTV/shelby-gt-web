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
    var listenScroll = true;
    var scroll = function(e,direction){
      var currentIndex = $nav.children('.list__item--selected').index();
      if(direction == 'previousSlide' && currentIndex < 1 || direction == 'nextSlide' &&  currentIndex >= $nav.children().length - 1) {
        listenScroll = true;
        return;
      }

      $nav.children().eq(direction == 'previousSlide' ? currentIndex - 1 : currentIndex + 1).children('a').trigger('click');
    };

    $(this).on('mousewheel DOMMouseScroll MozMousePixelScroll',function(e){
      // for firefox
      if(e.originalEvent.type == "MozMousePixelScroll" && listenScroll && (e.originalEvent.detail > 50 || e.originalEvent.detail < -50)) {
        listenScroll = false;
        var direction = (e.originalEvent.detail < 0 ? 'previousSlide' : 'nextSlide');
        scroll(e,direction);
      }
      // for non-firefox
      else if(listenScroll && (e.originalEvent.wheelDelta > 100 || e.originalEvent.wheelDelta < -100)) {
        listenScroll = false;
        var direction = (e.originalEvent.wheelDelta > 0 ? 'previousSlide' : 'nextSlide');
        scroll(e,direction);
      }
    }).on('slideChanged', function(e){
      listenScroll = true;
    });

    try {
      _gaq.push(['_trackEvent', 'Landing Page', 'Visit']);
    } catch(e) {}

    //button cache
    var $doc              = $('html,body'),
        $header           = $('.js-header'),
        $iphone           = $('.js-iphone');
        $iphoneSouth      = $('.js-iphone-south'),
        $iphoneViewport   = $iphone.find('.js-iphone-viewport')
        $target           = $('.js-target'),
        $horizontalIphone = $('.js-horz-iphone'),
        $nav              = $('.js-slide-navigator'),
        isHorizontal      = false,
        listening         = true;

    var shelf = {
      $cta    : $('#intro'),
      $iphone : $('#iphone'),
      $press  : $('#press'),
      $social : $('#social'),
      $stream : $('#stream')
    };

    var FANCY = {
      _headerHeight : 65, //offset by the height of the header.

      // jQuery.animate() specific configuration/defaults
      config : {
        _activeClass : 'list__item--selected', // className to indicate active slide of carousel.

        settings : {
          scrollTop : 0,
        },
        speed    : 800,
        callback : function(data){
          // bindable. for fancy interactions.
          $.event.trigger('slideChanged',data);

          var index = data.$target.index(); // offset by index of shelf__wrapper--cta (that's the first slide);
          $nav.children().removeClass(this._activeClass).eq(index).addClass(this._activeClass);
        }
      },

      beforeChange : function($target) {
        $.event.trigger('beforeChange', $target);
      },

      autoScroll : function($target,$prevTarget){
        var destination = $target.offset().top - this._headerHeight;

        this.config.settings.scrollTop = destination;

        var data = {
          scrollTop   : destination,
          $prevTarget : $prevTarget,
          $target     : $target
        }

        /*
          bind an element to the "beforeChange" event for immediate handling.
          otherwise, use the animate callback event, "slideChanged"
        */
        this.beforeChange(data);

        var self = this;

        $doc.animate(this.config.settings,this.config.speed,function(){ self.config.callback(data) });
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
    });

    $iphoneSouth.on('beforeChange',function(e,data){
      //hide iphone if direction is either going-to, or, coming-from press.
      if((data.$target[0] != shelf.$press[0] && data.$prevTarget[0] != shelf.$press[0]) ) {
        $(this).addClass('cloaked');
      }
    }).on('slideChanged',function(e,data){
      //if coming from stream
      var $this = $(this);

      switch(data.$prevTarget[0]){
        case shelf.$press[0] :
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

    shelf.$iphone.on('beforeChange',function(e,data){
      switch(data.$target[0]) {
        case shelf.$press[0] :
          $(this).hide();
          break;
      }
    }).on('slideChanged',function(e,data){
      switch(data.$target[0]) {
        case shelf.$social[0] :
          if($prevTarget[0] == shelf.$press[0]) {
            $(this).show();
          }
          break;
      }
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
  });