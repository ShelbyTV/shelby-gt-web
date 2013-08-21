//progressive enhancement: jquery.fitvid
//= require jquery
//= require_tree ./shares
//= require ./event-tracking/landing.tracking

$(document).ready(function(){
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
    else if($this.hasClass('js-community')) {
      window.location = "/community";
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
});