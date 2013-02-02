//= require jquery

$(document).ready(function(){
  //$('iframe.shelby').attr('src',"<%= Settings::Application.url %>/search");

  $('input:text').select();

  $('#js-submission-form').submit(function(){
    $('.js-submit').css('opacity','.5');
    // get url to fetch //

    var _query = $('.website').val();

    // message whats happening //
    $('input').blur().addClass('working');
    $('input:text').val('loading...').addClass('with-spinner');

    // clean  house //
    if (_query.slice(0,7) !== "http://"){ _query = "http://" + _query; }

    var _queryDomain = _query.slice(7).split('/')[0];
    $('#site-url').text(_queryDomain);

    // update iframe to fetch query //
    var _newSrc = '<%= Settings::Application.url %>/search?query='+_query;
    $('iframe.shelby').attr('src', _newSrc);

    // add spinner
    var opts = {
      lines: 13, // The number of lines to draw
      length: 6, // The length of each line
      width: 4, // The line thickness
      radius: 10, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      color: '#999', // #rgb or #rrggbb
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: 'auto', // Top position relative to parent in px
      left: 'auto' // Left position relative to parent in px
    };
    var target = $('.website')[0];
    var spinner = new Spinner(opts).spin();
    $(spinner.el).insertBefore(target);

    // prepare ui to change //
    setTimeout(function(){
      $('iframe.shelby').css('height',$('body').height()-40);
      $('iframe.shelby').removeClass('hidden').addClass('with-banner');
      $('#video-static').remove();
      $('#static-wrapper').remove();
      $('#banner-wrapper').removeClass('hidden');
      // new social buttons
      var _newUrl;
      if (document.location.href.split("?").length > 1) {
        _newUrl = document.location.href;
      }
      else {
        _newUrl = document.location.href+'?q='+_queryDomain;
      }

      // update twitter share
      $('.social .twitter').append('<a href="https://twitter.com/share" class="twitter-share-button" data-related="shelby" data-url="'+ _newUrl+'" data-lang="en" data-size="small" data-count="horizontal" data-text="Turn any website into a TV experience">Tweet</a>');
      twttr.widgets.load();
      // update fb like
      $('.social .facebook').append('<div class="fb-like" data-send="false" data-layout="button_count" data-width="300" data-show-faces="false" data-colorscheme="light" data-action="like" data-href="http://shelby.tv/experience"></div>');
      FB.XFBML.parse();
      // update goog +1
      gapi.plusone.render('google-plus-one',{"size": "medium"});

    }, 7000);

    // update progress of fetch //
    var _i = 0, progressStates = ["herding goats",
                                  "attaching video to them",
                                  "delivering goats via satellite"];
    var progressTimer = setInterval(function(){
      if (_i <= 2){
        $('input:text').val(progressStates[_i]+'...');
        _i+=1;
      }
      else {
        clearInterval(progressTimer);
      }

    }, 1500);


    return false;
  });

  $('#learn-more-wrapper #learn-more-icon').on('click', function(){
    $("#learn-more").toggle();
  });
});