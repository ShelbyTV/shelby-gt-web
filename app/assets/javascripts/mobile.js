//= require jquery

//for sharing.
//= require ./backbone/underscore.js
//= require ../templates/share-page-form.jst.ejs
//= require ../templates/liker-item.jst.ejs

//load event tracking js
//= require ./event-tracking/mobile.tracking.js

var libs = {
  config : {
    shelbyGT : {
      UserAvatarSizes : {
        small : "sq48x48"
      }
    },

    avatarUrlRoot: '//s3.amazonaws.com/shelby-gt-user-avatars'
  }
};

$(document).ready(function(){
  var loc = shelbyTrackingCategory || "Mobile",
      username = shelbyTrackingLabel || "Anonymous" ;

  shelby.trackEx({
    providers : ['ga'],
    gaCategory : loc,
    gaAction : 'Visit page',
    gaLabel : username
  });

  $('.js-list').on('click', '.js-toggle-comment',function(){
    var $this = $(this);
    $this.toggleClass('line-clamp--open', !$this.hasClass('line-clamp--open'));
  });

  $('.js-settings-dropdown, .js-login-dropdown, .js-content-selector').on('click','button',function(e){
    e.preventDefault();
    var $this = $(this);

    if($this.hasClass('js-do-nothing')){
      return false;
    }
    if($this.hasClass('js-login-dropdown-button')){
      var $loginDropdown = $('.js-login-dropdown');
      $loginDropdown.toggleClass('hidden',!$loginDropdown.hasClass('hidden'));
    }
    else if($this.hasClass('js-settings-dropdown-button')){
      var $settingsDropdown = $('.js-settings-dropdown');
      $settingsDropdown.toggleClass('hidden',!$settingsDropdown.hasClass('hidden'));
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

  var user = JSON.parse($('#js-user').text()),
      users = [];

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
      $sharePanel.find('#frame_comment').focus();
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
              $guide.toggleClass('hidden',!$guide.hasClass('hidden'));

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

    $('.js-toggle-follow').on('click',function(e){
      e.preventDefault();
      var $this   = $(this),
          roll_id = $this.data('roll_id'),
          method  = $this.hasClass('button_green') ? 'join' : 'leave';

      $.ajax({
        type: 'GET',
        url: '//api.shelby.tv/v1/POST/roll/'+ roll_id +'/'+ method,
        dataType: "jsonp",
        timeout: 10000,
        crossDomain: true,
        data: { roll_id: roll_id },
        xhrFields: {
          withCredentials: true
        },
        success: function (response) {
          var text = (method == 'join') ? 'Following' : 'Follow';

          method = (method == 'join') ? 'leave' : 'join';

          $this.toggleClass('button_gray button_green button_active').text(text);
        },
        error: function (e) { console.log("API Error: Unabled to Unfollow",e); }
      });

    });

  }

  //does not depend on user model
  $('.js-load-more').on('click', function(e){
    e.preventDefault();

    var $this = $(this).addClass('button_busy');

    $.get($this.attr('href'), function(data){
      $this.removeClass('button_busy');

      var $items  = $(data).find('.js-list').children('.list__item'),
          $button = $(data).find('.js-load-more');

      $('.js-list').append($items);
      $('.js-load-more').attr('href',$button.attr('href'));

      _($items.children('.js-frame')).each(function(item){
        var $el = $(item);
        var $likers = $el.find('.js-likes-array');

        if($likers && $likers.length){
          $likers = JSON.parse($likers.html());
          injectLikers($likers,$el);
        }
      });
    });
  });

  $('.js-list').on('click', '.js-like', function(e){
    var $this = $(this);

    //prevent extraneous api calls
    if($(this).hasClass('visuallydisabled')) { return false; }

    e.preventDefault();

    $(this).children('.icon-like').addClass('icon-like--red');

    var frame_id = $this.data('frame_id'),
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

  var injectLikers = function(likers,$scope){
    if(likers.length) {
      var data = {
        ids: likers.join(',')
      };

      $.ajax({
        type: 'GET',
        url: '//api.shelby.tv/v1/user',
        dataType: "jsonp",
        timeout: 10000,
        crossDomain: true,
        data: data,
        xhrFields: {
          withCredentials: true
        },
        success: function (response) {
          $scope.find('.js-liker-avatars-list').empty();

          for(var i = 0; i < response.result.length; i++) {

            var user = response.result[i],
                avatar;

            if( !user ){
              avatar = "/images/assets/avatar.png";
            }
            else if(user.has_shelby_avatar){
              avatar = libs.config.avatarUrlRoot + '/' + libs.config.shelbyGT.UserAvatarSizes.small + '/' + user.id + '?' + new Date(user.avatar_updated_at).getTime();
            } else {
              avatar = (user.user_image_original != 'null' && user.user_image_original) || (user.user_image != 'null' && user.user_image) || "/images/assets/avatar.png";
            }

            $scope.find('.js-liker-avatars-list').append(SHELBYJST['liker-item']({
              avatar: avatar,
              liker: user
            }));
          }
        },
        error: function (e) {
          console.log("Oops!",e.statusText);
        }
      });
    }
  };

  $(this).on('frameLoaded',function(e){
    console.log('e',e);
    var $el = $('#'+e.frame_id);
    var likers = JSON.parse($el.find('.js-likes-array').html());

    if(likers.length){
      injectLikers(likers,$el);
    }
  });
});
