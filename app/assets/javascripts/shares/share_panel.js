var Interactions = Backbone.View.extend({
  options : {
    apiRoot         : '//api.shelby.tv/v1',
    sharePanelClass : '.js-shares',
    sharePanelData  : {
      anonymous             : false,
      currentFrameShortlink : null,
      facebook_enabled      : false,
      facebook_checked      : false,
      frameId               : null,
      twitter_enabled       : false,
      twitter_checked       : false,
      twitter_intent        : null,
      username              : $('body').data('username'),
      shortlinkable         : !$('body').hasClass('shelby--radar')
    },
    source         : $body.hasClass('shelby--radar') ? 'bookmarklet' : 'share',

  },

  el: $('.frame_interactions'),

  sharePaneljst: function(data){
    return SHELBYJST['share-page-form'](data);
  },

  events: {
    'click .js-share-init'    : 'toggleSharePanel',
    'click .js-like'          : 'doLike',
    'click .js-share-it'      : 'submitShare',
    'click .js-cancel'        : 'toggleSharePanel',
    'submit .js-share-submit' : 'submitShare'
  },

  initialize : function(e){
    this.options.sharePanelData.frameId = this.$el.data('video_id');
    this.options.user = JSON.parse($('#js-user').html() || {});
    this.render();
  },
  _cleanup: function(){

  },
  render : function(){
    var data = _(this.options.sharePanelData).extend(this._getUserAuthentications());

    this.$el.find(this.options.sharePanelClass).html(this.sharePaneljst(data));
  },

  doLike : function(e){
    var self    = this,
        $button = $(e.currentTarget);

    //prevent extraneous api calls
    if($button.hasClass('visuallydisabled')) { return false; }

    e.preventDefault();

    $button.children('.icon-like').addClass('icon-like--red');
    $button.children('.button_label').text('Liked');

    $.ajax({
      type: 'GET',
      url: this.options.apiRoot + '/POST/roll/' + this.options.user['watch_later_roll_id'] + '/frames',
      dataType: "jsonp",
      timeout: 10000,
      crossDomain: true,
      data: {
        provider_id   : $button.data('provider_id'),
        provider_name : $button.data('provider_name'),
        url           : libs.utils.composeKnownUrl($button.data('provider_name'),$button.data('provider_id'))
      },
      xhrFields: {
        withCredentials : true
      },
      success: function () {},
      error: function () {}
    });

    $button.addClass('visuallydisabled');

  },
  toggleSharePanel: function(e){
    this.$el.find(this.options.sharePanelClass).toggleClass('hidden');
  },
  submitShare: function(e){
    e.preventDefault();

    var $button = $(e.currentTarget),
        data = {
          source: this.options.source,
          text: this.$el.find('#frame_comment').val(),
          frame_id: this.$el.find('#frame_id').val()
        },
        destinations = [];

    if (this.options.source == 'bookmarklet') {
      data.url = libs.utils.composeKnownUrl($button.data('provider_name'),$button.data('provider_id'));
      delete data.frame_id;
    }

    if ($('#share-on-facebook').is(':checked')) {
      destinations.push('facebook');
    }

    if ($('#share-on-twitter').is(':checked')) {
      destinations.push('twitter');
    }

    $.ajax({
      type: 'GET',
      url: apiRoot + '/POST/roll/' + this.user['personal_roll_id'] + '/frames',//should we make a user backbone model and injest it from a script tag? probs. globally accessible then. FTW
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
  },

  _getUserAuthentications : function(){
    var data,
        user = JSON.parse($('#js-user-model').html()) || {};

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

    return data;
  }
});

var FrameInteractions = new Interactions();


/*
//INIT
$(function() {
  // "globals"
  var $dropdown      = $('.js-shares'),
    $frame           = $('.js-frame'),
    $body            = $('body'),
    $notification    = $('.js-notification'),
    $shareInitButton = $('.js-share-init'),
    frame_id         = $frame.attr('id'),
    video_id         = $frame.data('video_id'),
    personal_roll_id = $body.data('personal_roll_id'),
    username         = $body.data('user_name'),
    user             = JSON.parse($('#js-user-model').html()) || {},
    apiRoot          = '//api.shelby.tv/v1';

  // share pane template data
  var data = {
    anonymous: false,
    currentFrameShortlink: null,
    facebook_enabled: false,
    facebook_checked: false,
    frameId: frame_id,
    twitter_enabled: false,
    twitter_checked: false,
    twitter_intent: "#tweet",
    username: username,
    shortlinkable: !$body.hasClass('shelby--radar')
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
        source: ($body.hasClass('shelby--radar') ? 'bookmarklet' : 'share'),
        text: $this.find('#frame_comment').val(),
        frame_id: $this.find('#frame_id').val()
      },
      destinations = [];

    if ($body.hasClass('shelby--radar')) {
      data.url = libs.utils.composeKnownUrl($body.data('provider_name'),$body.data('provider_id'));
      delete data.frame_id;
    }

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


    if( !$body.hasClass('shelby--radar') ){
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
    } else {
      $body.data({
        'provider_name'  : $(this).data('provider_name'),
        'provider_id'    : $(this).data('provider_id')
      });
    }

    var $this = $(this);
    $this.toggleClass('button_active', !$this.hasClass('button_active'));

    var _$dropdown = $this.closest('.frame_interactions').find('.share_panel');
    _$dropdown.toggleClass('hidden', !_$dropdown.hasClass('hidden'));
    _$dropdown.find('#frame_comment').focus();
  });
});
*/
