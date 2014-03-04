$(function(){
  Shelby.RollheaderView = Backbone.View.extend({
    options: {
      sources : { bookmarklet: 'bookmarklet', shares: 'shares', mobile: 'mobile'}
    },

    el: $('.js-sources-list, .js-roll-header'),

    events: {
      'click .js-toggle-follow:not(.js-busy)' : 'followOrUnfollow'
    },

    initialize: function(){
      console.log('rollheaderinit',this);
    },

    followOrUnfollow: function(e){
      e.preventDefault();

      var self    = this,
          $button = $(e.currentTarget),
          roll_id = $button.data('roll_id'),
          method  = $button.hasClass('button_green') ? 'join' : 'leave';

      $button.addClass('js-busy');

      // immediately toggle the button - if the ajax fails, we'll update the next time we render
      var newButtonText = (method == 'join') ? 'Following' : 'Follow';
      $button.toggleClass('button_gray button_green button_active').text(newButtonText);

      $.ajax({
        type: 'GET',
        url: Shelby.apiRoot + '/POST/roll/' + roll_id + '/' + method,
        dataType: "jsonp",
        timeout: 10000,
        crossDomain: true,
        data: {
          roll_id: roll_id
        },
        xhrFields: {
          withCredentials: true
        },
        success: function(response) {
          // var user = JSON.parse($('#js-user').text());
          if (Shelby.User.get('user_type') == Shelby.libs.User.user_types.anonymous && typeof Shelby.User.get('app_progress').followedSource == "undefined") {
            Shelby.User.updateAppProgress("followedSources",true);
          }
          $button.removeClass('js-busy');
        },
        error: function(e) {
          $button.removeClass('js-busy');
        }
      });
    }
  });
});
