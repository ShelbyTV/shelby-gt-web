//JST
//= require ../../templates/share-page-form.jst.ejs

//INIT
$(function() {
  // "globals"
  var $dropdown = $('.js-shares'),
    $frame = $('.js-frame'),
    $body = $('body'),
    $notification = $('.js-notification'),
    $shareInitButton = $('.js-share-init'),
    frame_id = $frame.attr('id'),
    video_id = $frame.data('video_id'),
    personal_roll_id = $body.data('personal_roll_id'),
    username = $body.data('user_name'),
    user = JSON.parse($('#js-user-model').html()) || {},
    apiRoot = '//api.shelby.tv/v1';

  // share pane template data
  var data = {
    twitter_enabled: false,
    twitter_checked: false,
    facebook_enabled: false,
    facebook_checked: false,
    currentFrameShortlink: null,
    frameId: frame_id,
    username: username,
    twitter_intent: "#tweet"
  };


  // get user
  if (user) {
    for (var auth in user.authentications) {
      service = user.authentications[auth];

      if (service.provider == 'twitter') {
        data.twitter_enabled = true;
        data.twitter_checked = user.app_progress.share_twitter_enabled;
      } else if (service.provider == 'facebook') {
        data.facebook_enabled = true;
        data.twitter_checked = user.app_progress.share_facebook_enabled;
      }
    }

    // append share pane dynamically.
    $dropdown.html(SHELBYJST['share-page-form'](data));

    $('.js-toggle-twitter-sharing, .js-toggle-facebook-sharing').on('click', function(e) {
      var $this = $(e.currentTarget),
        network = $this.data('network');

      $this.parent()
        .toggleClass('button_gray', !$this.is(':checked'))
        .toggleClass('button_' + network + '-blue', $this.is(':checked'));
    });

    $('.js-tweet-intent').on('click',function(e){
      e.preventDefault();

      var url = 'https://twitter.com/intent/tweet?related=shelby&via=shelby&url=' + "this._shortlink" + '&text=' + encodeURIComponent('Video Title');
      window.open(url, "twitterShare", "");
    });

    $('.js-facebook-msg').on('click',function(e){
      e.preventDefault();

      FB.ui(
        {
          caption     : 'Shelby.tv',
          description : "video.get('description')",
          display     : 'popup',
          link        : "this._shortlink",
          method      : 'feed',
          name        : "video.get('title')",
          picture     : "video.get('thumbnail_url')"
        },
        function(response) {
          if (response && response.post_id) {
            // TODO:we should record that this happened.
          }
        }
      );

    });

    // determine if Video has been liked, depends on user being loaded.
    $.ajax({
      type: 'GET',
      url: apiRoot + '/video/queued',
      dataType: "jsonp",
      timeout: 10000,
      crossDomain: true,
      data: {},
      xhrFields: {
        withCredentials: true
      },
      success: function(response) {
        var likes = response.result;
        for (var i = 0; i < likes.length; i++) {
          if (likes[i].id == video_id) {
            $('.js-like').addClass('visuallydisabled').children('.icon-like').addClass('icon-like--red');
          }
        }
      },
      error: function(e) {
        console.log("API Error: Unabled to persist Like", e);
      }
    });
  }

  //on Share form submit
  $('#share-it').live('submit', function(e) {
    e.preventDefault();
    var $this = $(this),
      data = {
        source: 'share',
        text: $this.find('#frame_comment').val(),
        frame_id: $this.find('#frame_id').val()
      },
      destinations = [];

    if ($('#share-on-facebook').is(':checked')) {
      destinations.push('facebook');
    }

    if ($('#share-on-twitter').is(':checked')) {
      destinations.push('twitter');
    }

    $.ajax({
      type: 'GET',
      url: apiRoot + '/POST/roll/' + personal_roll_id + '/frames',
      dataType: "jsonp",
      timeout: 10000,
      crossDomain: true,
      data: data,
      xhrFields: {
        withCredentials: true
      },
      success: function(response) {
        console.log("Share successful!");

        $notification.removeClass('hidden');

        setTimeout(function() {
          $notification.addClass('hidden');
        }, 3000);

        $shareInitButton.toggleClass('button_active', false);
        $dropdown.toggleClass('hidden', true);

        var new_frame_id = response.result.id,
            shareData = {
              destination: destinations,
              frame_id: new_frame_id,
              text: data.text
            };

        shelby.trackEx({
          providers: ['ga', 'kmq'],
          gaCategory: shelbyTrackingCategory,
          gaAction: 'shared',
          gaLabel: username,
          gaValue: destinations.length,
          kmqProperties: {
            'outbound destination': destinations.join(", "),
          }
        });

        if (shareData.destination.length > 0) {
          $.ajax({
            type: 'GET',
            url: apiRoot + '/POST/frame/' + new_frame_id + '/share',
            dataType: "jsonp",
            timeout: 10000,
            crossDomain: true,
            data: shareData,
            xhrFields: {
              withCredentials: true
            },
            success: function(response) {

              console.log("Social Share successful!");
            },
            error: function() {
              console.log("Social Sharing failed.");
            }
          });
        }
      },
      error: function(e) {
        console.log("Share unsuccessful: ", e);
      }
    });

  });


  $('.js-cancel').on('click', function(e) {
    e.preventDefault();

    $shareInitButton.toggleClass('button_active', false);
    $dropdown.toggleClass('hidden', true);
  });

  $shareInitButton.on('click', function(e) {
    e.preventDefault();

    var data = {
      frame_id: frame_id
    };

    $.ajax({
      type: 'GET',
      url: apiRoot + '/frame/' + data.frame_id + '/short_link',
      dataType: "jsonp",
      timeout: 10000,
      crossDomain: true,
      data: data,
      xhrFields: {
        withCredentials: true
      },
      success: function(response) {
        $('#shortlink').removeAttr('disabled').val(response.result.short_link);
      },
      error: function() {
        $('#shortlink').val('Error…');
      }
    });

    var $this = $(this);
    $this.toggleClass('button_active', !$this.hasClass('button_active'));

    $dropdown.toggleClass('hidden', !$dropdown.hasClass('hidden'));
    $dropdown.find('#frame_comment').focus();
  });
});
