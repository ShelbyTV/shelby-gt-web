//= require jquery
//= require ./jquery-plugins/jquery.urlparams.js
//= require ./backbone/underscore.js
//= require ./event-tracking/landing.tracking

$(document).ready(function(){
  var loc = shelbyTrackingCategory || "Share Page",
      username = shelbyTrackingLabel || "Anonymous" ;

  shelby.trackEx({
    providers : ['ga'],
    gaCategory : loc,
    gaAction : 'Visit page',
    gaLabel : username
  });

  //imitation handling
  $('.js-toggle-comment').on('click',function(){
    var $this = $(this);
    $this.toggleClass('line-clamp--open', !$this.hasClass('line-clamp--open'));
  });

  //imitation handling
  $('.js-content-selector').on('click','button',function(e){
    e.preventDefault();
    var $this = $(this);

    if($this.hasClass('js-do-nothing')){
      return false;
    }
    else if($this.hasClass('js-stream')) {
      window.location = "/stream";
    }
    else if($this.hasClass('js-featured')) {
      window.location = "/featured";
    }
    else if($this.hasClass('js-me')) {
      var username = $('.app_nav__button--settings').text().trim();
      window.location = '/' + username;
    }
    else if($this.hasClass('js-signout')) {
      window.location = "/signout";
    } else {
      window.location = $this.attr('href');
    }
  });

  // dynamically load the share pane, OR, handle for anonymous users
  if($('body').hasClass('shelby--shares_enabled')) {
    var c      = document.createElement("script");
        c.type = "text/javascript";
        c.src  = '/assets/shares/shares_enabled.js';
    document.body.appendChild(c);
  } else {
    var $signupMessage = $('.js-seo-signup-message').on('click', function(){
      $(this).addClass('hidden');

      try {
        _gaq.push(['_trackEvent', 'Share Page', 'Click on body with modal', "When clicking related video"]);
      } catch(e) {}
    });
    //handle "Share" button differently, since there's no Share Pane.
    $('.js-share-init').removeAttr('disabled').on('click',function(){
      $signupMessage.removeClass('hidden');
    });
  }

  // handle liking, regardless of user anonymity
  $('.js-like').on('click', function(e){
    var $this = $(this);

    //prevent extraneous api calls
    if($(this).hasClass('visuallydisabled')) { return false; }

    e.preventDefault();

    $(this).children('.icon-like').addClass('icon-like--red');

    var frame_id = $('.js-frame').attr('id'),
        data = { frame_id : frame_id };

    $.ajax({
      type: 'GET',
      url: '//api.shelby.tv/v1/PUT/frame/' + frame_id + '/like',
      dataType: "jsonp",
      timeout: 10000,
      crossDomain: true,
      data: data,
      xhrFields: {
        withCredentials: true
      },
      success: function () {
        var $total = $('.js-like-total');

        if($total.length){
          $total.text( '+ ' + (+($total.text().split('+')[1].trim()) + 1 ));
        }
      },
      error: function () {}
    });

    $this.addClass('visuallydisabled');
  });
});
