//App
//= require ../app/libs.namespace
//= require ../app/app.config.js
//= require ../app/app.namespace.js

//JST
//= require ../../templates/share-page-form.jst.ejs

//INIT

$(function(){
  // "globals"
  var $dropdown = $('.js-shares'),
      $frame    = $('.js-frame'),
      frame_id  = $frame.attr('id'),
      video_id  = $frame.data('video_id'),
      roll_id   = $frame.data('roll_id');

  //determine if Video has been liked.
  $.ajax({
      type: 'GET',
      url: '//api.shelby.tv/v1/video/queued',
      dataType: "jsonp",
      timeout: 10000,
      async: true,
      crossDomain: true,
      data: data,
      xhrFields: {
        withCredentials: true
      },
      success: function (response) {
        var likes = response.result;
        for(var i = 0; i < likes.length; i++) {
          if(likes[i].id == video_id) {
            $('.js-like').addClass('visuallydisabled').children('.icon-like').addClass('icon-like--red');
          }
        }
      },
      error: function (e) {
        console.log("API Error");
      }
  });

  //share pane settings
  var data = {
    twitter_enabled : false,
    twitter_checked : true,
    facebook_enabled: false,
    facebook_checked: true,
    userLoggedIn : false,
    currentFrameShortlink : 'ad',
    frameId : $('.js-frame').attr('id')
  };

  //append share pane dynamically.
  $dropdown.html(SHELBYJST['share-page-form'](data));

  //on Share form submit
  $('#share-it').live('submit', function(e){
    e.preventDefault();
    var $this = $(this);

      // $('.js-share-it')

      var data = {
        source: 'share',
        text: $this.find('#frame_comment').val(),
        frame_id: $this.find('#frame_id').val()
      };

      $.ajax({
          type: 'GET',
          url: '//api.shelby.tv/v1/POST/roll/' + roll_id + '/frames',
          dataType: "jsonp",
          timeout: 10000,
          async: true,
          crossDomain: true,
          data: data,
          xhrFields: {
              withCredentials: true
          },
          success: function (response) {
              console.log(response);
          },
          error: function () {
              console.log("Cannot roll");
          }
      });

      $.ajax({
          type: 'GET',
          url: '//api.shelby.tv/v1/frame/' + data.frame_id + '/short_link',
          dataType: "jsonp",
          timeout: 10000,
          async: true,
          crossDomain: true,
          data: data,
          xhrFields: {
              withCredentials: true
          },
          success: function (response) {
              console.log(response);
          },
          error: function () {
              console.log("Cannot roll");
          }
      });

  });

  $shareInitButton = $('.js-share-init');

  $('.js-cancel').on('click',function(e){
    e.preventDefault();

    $shareInitButton.toggleClass('button_active',false);
    $dropdown.toggleClass('hidden',true);
  });

  $shareInitButton.on('click',function(e){
    e.preventDefault();

    var $this = $(this);
    $this.toggleClass('button_active',!$this.hasClass('button_active'));

    $dropdown.toggleClass('hidden',!$dropdown.hasClass('hidden'));
  });

  $('.js-like').on('click', function(e){
    //prevent extraneous api calls
    if($(this).hasClass('visuallydisabled')) { return false; }

    e.preventDefault();

    $(this).children('.icon-like').addClass('icon-like--red');

    var frame_id = $('#frame_id').val(),
        data = { frame_id : frame_id };

    $.ajax({
        type: 'GET',
        url: '//api.shelby.tv/v1/PUT/frame/' + frame_id + '/like',
        dataType: "jsonp",
        timeout: 10000,
        async: true,
        crossDomain: true,
        data: data,
        xhrFields: {
            withCredentials: true
        },
        success: function (response) {
            console.log(response);
        },
        error: function () {
            console.log("Cannot like");
        }
    });
  });
});