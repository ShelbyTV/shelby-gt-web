//JST
//= require ../../templates/share-page-form.jst.ejs

//INIT
$(function(){
  // "globals"
  var $dropdown        = $('.js-shares'),
      $frame           = $('.js-frame'),
      $shareInitButton = $('.js-share-init'),
      frame_id         = $frame.attr('id'),
      video_id         = $frame.data('video_id'),
      personal_roll_id = $frame.data('personal_roll_id'),
      username         = $frame.data('user_name'),
      user             = {};

  // share pane template data
  var data = {
    twitter_enabled       : false,
    twitter_checked       : false,
    facebook_enabled      : false,
    facebook_checked      : false,
    currentFrameShortlink : null,
    frameId               : frame_id,
    username              : username
  };

  // append share pane dynamically.
  $dropdown.html(SHELBYJST['share-page-form'](data));

  // determine if Video has been liked.
  $.ajax({
    type: 'GET',
    url: '//api.shelby.tv/v1/video/queued',
    dataType: "jsonp",
    timeout: 10000,
    crossDomain: true,
    data: {},
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
      console.log("API Error: ",e);
    }
  });

  // get user
  $.ajax({
    type: 'GET',
    url: '//api.shelby.tv/v1/user/' + username,
    dataType: "jsonp",
    timeout: 10000,
    crossDomain: true,
    data: {},
    xhrFields: {
      withCredentials: true
    },
    success: function (response) {
      user = response.result;

      for (var auth in user.authentications) {
        service = user.authentications[auth];

        if(service.provider == 'twitter') {
          data.twitter_enabled = true;
          data.twitter_checked = user.app_progress.share_twitter_enabled;
        }
        else if (service.provider == 'facebook') {
          data.facebook_enabled = true;
          data.twitter_checked = user.app_progress.share_facebook_enabled;
        }
      }
    },
    error: function (e) {
      console.log("API Error: ",e);
    }
  });


  //on Share form submit
  $('#share-it').live('submit', function(e){
    e.preventDefault();
    var $this = $(this),
        data = {
          source: 'share',
          text: $this.find('#frame_comment').val(),
          frame_id: $this.find('#frame_id').val()
        },
        destinations = [];

    if($('#share-on-facebook').is(':checked')) {
      destinations.push('facebook');
    }

    if($('#share-on-twitter').is(':checked')) {
      destinations.push('twitter');
    }

    $.ajax({
      type: 'GET',
      url: '//api.shelby.tv/v1/POST/roll/' + personal_roll_id + '/frames',
      dataType: "jsonp",
      timeout: 10000,
      crossDomain: true,
      data: data,
      xhrFields: {
        withCredentials: true
      },
      success: function (response) {
        console.log("Share successful!");

        $shareInitButton.toggleClass('button_active',false);
        $dropdown.toggleClass('hidden',true);

        var new_frame_id = response.result.id,
            shareData    = {
              destination: destinations,
              frame_id: new_frame_id,
              text: data.text
            };

        shelby.trackEx({
          providers : ['ga', 'kmq'],
          gaCategory : 'Share Page',
          gaAction : 'shared',
          gaLabel : username,
          gaValue : destinations.length,
          kmqProperties : {
            'outbound destination': destinations.join(", "),
          }
        });

        if(shareData.destination.length > 0) {
          $.ajax({
            type: 'POST',
            url: '//api.shelby.tv/v1/POST/frame/' + new_frame_id + '/share',
            dataType: "jsonp",
            timeout: 10000,
            crossDomain: true,
            data: shareData,
            xhrFields: {
              withCredentials: true
            },
            success: function (response) {
              console.log("Social Share successful!");
            },
            error: function () {
              console.log("Social Sharing failed.");
            }
          });
        }
      },
      error: function (e) {
        console.log("Share unsuccessful: ",e);
      }
    });

  });


  $('.js-cancel').on('click',function(e){
    e.preventDefault();

    $shareInitButton.toggleClass('button_active',false);
    $dropdown.toggleClass('hidden',true);
  });

  $shareInitButton.on('click',function(e){
    e.preventDefault();

    var data = { frame_id: frame_id };

    $.ajax({
      type: 'GET',
      url: '//api.shelby.tv/v1/frame/' + data.frame_id + '/short_link',
      dataType: "jsonp",
      timeout: 10000,
      crossDomain: true,
      data: data,
      xhrFields: {
        withCredentials: true
      },
      success: function (response) {
        $('#shortlink').removeAttr('disabled').val(response.result.short_link);
      },
      error: function () {
        $('#shortlink').val('Error…');
      }
    });

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
      crossDomain: true,
      data: data,
      xhrFields: {
        withCredentials: true
      },
      success: function () {},
      error: function () {}
    });
  });

  $('.js-toggle-twitter-sharing, .js-toggle-facebook-sharing').on('click',function(e){
    var $this = $(e.currentTarget),
        network = $this.data('network');

    $this.parent()
            .toggleClass('button_gray',!$this.is(':checked'))
            .toggleClass('button_'+network+'-blue',$this.is(':checked'));
  });
});