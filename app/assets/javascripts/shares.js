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

  if($('body').hasClass('shelby--shares_enabled')) {
    // mini-app
    // var files = [],
    //     frame = $('.js-frame').attr('id');

    // if(username) {
    //   files.push('//api.shelby.tv/v1/user/' + username);
    // }

    // if(frame) {
    //   files.push('//api.shelby.tv/v1/frame/' + frame);
    // }

    // var SHARE = {};

    // _(files).each(function(data,index){
    //   console.log(data,index);
    // });

    var c      = document.createElement("script");
        c.type = "text/javascript";
        c.src  = '/assets/shares/shares_enabled.js';
    document.body.appendChild(c);
  }

});
