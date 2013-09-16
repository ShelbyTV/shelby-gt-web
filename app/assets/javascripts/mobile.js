//= require jquery

//for sharing.
//= require ./backbone/underscore.js
//= require ../templates/share-page-form.jst.ejs

//load event tracking js
//= require ./event-tracking/mobile.tracking.js

$(document).ready(function(){
  $('.js-toggle-comment').on('click',function(){
    var $this = $(this);
    $this.toggleClass('line-clamp--open', !$this.hasClass('line-clamp--open'));
  });


  var user = JSON.parse($('#js-user').text());

  if(user) {

    var $guide = $('.js-guide');

    var data = {
        twitter_enabled       : false,
        twitter_checked       : false,
        facebook_enabled      : false,
        facebook_checked      : false,
        currentFrameShortlink : null,
        frameId               : null,
        username              : shelbyTrackingLabel
      };

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

    var $sharePanel = $('.js-share-panel').html(SHELBYJST['share-page-form'](data));

    var $shareInitButton = $guide.on('click','.js-share-init',function(e){
      e.preventDefault();
      var $this = $(e.currentTarget),
          frame_id = $this.data('frame_id');

      $('#frame_id').val(frame_id);

      $.ajax({
        type: 'GET',
        url: '//api.shelby.tv/v1/frame/' + frame_id + '/short_link',
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

      $sharePanel.toggleClass('hidden',!$sharePanel.hasClass('hidden'));
      $guide.toggleClass('hidden',!$guide.hasClass('hidden'));
    });

    $('.js-toggle-twitter-sharing, .js-toggle-facebook-sharing').on('click',function(e){
      var $this = $(e.currentTarget),
          network = $this.data('network');

      $this.parent()
              .toggleClass('button_gray',!$this.is(':checked'))
              .toggleClass('button_'+network+'-blue',$this.is(':checked'));
    });

    var $submitShareForm = $('#share-it').on('submit', function(e){
      e.preventDefault();
          var data = {
            frame_id: $sharePanel.find('#frame_id').val(),
            source: 'share',
            text: $sharePanel.find('#frame_comment').val(),
          },
          destinations = [];

          if($sharePanel.find('#share-on-facebook').is(':checked')) {
            destinations.push('facebook');
          }

          if($sharePanel.find('#share-on-twitter').is(':checked')) {
            destinations.push('twitter');
          }

          $.ajax({
            type: 'GET',
            url: '//api.shelby.tv/v1/POST/roll/' + user.personal_roll_id + '/frames',
            dataType: "jsonp",
            timeout: 10000,
            crossDomain: true,
            data: data,
            xhrFields: {
              withCredentials: true
            },
            success: function (response) {
              console.log("Share successful!");

              $sharePanel.toggleClass('hidden',true);

              var new_frame_id = response.result.id,
                  shareData    = {
                    destination: destinations,
                    frame_id: new_frame_id,
                    text: data.text
                  };

              shelby.trackEx({
                providers : ['ga', 'kmq'],
                gaCategory : shelbyTrackingCategory,
                gaAction : 'shared',
                gaLabel : shelbyTrackingLabel,
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
      $sharePanel.toggleClass('hidden',true);
      $guide.toggleClass('hidden',false);
    });
  }

  //does not depend on user model
  $('.js-like').on('click', function(e){
    var $this = $(this);

    //prevent extraneous api calls
    if($(this).hasClass('visuallydisabled')) { return false; }

    e.preventDefault();

    $(this).children('.icon-like').addClass('icon-like--red');

    var frame_id = $this.data('frame_id'),
        data = { frame_id : frame_id };
        console.log(data);
      return false;

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
