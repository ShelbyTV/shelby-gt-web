$(function(){
  Shelby.GuideView = Backbone.View.extend({
    options: {
      sources : { bookmarklet: 'bookmarklet', shares: 'shares'}
    },
    events: {
      'click a' : 'aclicked'
    },
    aclicked:function(e){
      e.preventDefault();

      console.log(e.target);
    },
    el: $('.js-guide'),
    initialize: function(){
      var self         = this,
          media = this.$el.find('.js-frame');

      this.options.source = this._getDisplayState();

      _(media).each(function(el,index){
        new Shelby.FrameView({
          el     : el,
          user   : Shelby.User,
          source : self.options.source
        });
      });
    },
    _getDisplayState : function(){
      return $('body').hasClass('shelby--radar') ? this.options.sources.bookmarklet : this.options.sources.shares;
    }
  });



  //Mobile web requires more functionality
  Shelby.MobileGuideView = Shelby.GuideView.extend({
    events: _.extend({},Shelby.GuideView.prototype.events,{
      'click .js-load-more' : 'loadMore'
    }),

    loadMore: function(e){
      e.preventDefault();

      var self = this,
          $this = $(e.target).addClass('button_busy');

      window.setTimeout(function() {
        $.get($this.attr('href'), function(data) {
          $this.removeClass('button_busy');

          var $items  = $(data).find('.js-list').children('.list__item'),
              $button = $(data).find('.js-load-more');

          $('.js-list').append($items);
          $('.js-load-more').attr('href', $button.attr('href'));

          self._processNewLikers($items);
        });
      }, 100);
    },

    _processNewLikers: function($items){
      var self = this;

      _($items.children('.js-frame')).each(function(item) {
        var $el = $(item);
        var $likers = $el.find('.js-likes-array');

        if ($likers && $likers.length) {
          $likers = JSON.parse($likers.html());
          self._fetchLikers($likers, $el);
        }
      });
    },

    _fetchLikers: function(likers,$el){
        var self = this,
            data = {
              ids: likers.join(',')
            };

        $.ajax({
          type: 'GET',
          url: Shelby.apiRoot + '/user',
          dataType: "jsonp",
          timeout: 10000,
          crossDomain: true,
          data: data,
          xhrFields: {
            withCredentials: true
          },
          success: function(response) {
            var $container = $el.find('.js-liker-avatars-list').empty(),
                likerArray = response.result;

            self._appendLikers(likerArray,$container);
          },
          error: function(e) {
            console.log("Oops!", e.statusText);
          }
        });
      },

      _appendLikers: function(likerArray, $el){
        for (var i = 0; i < likerArray.length; i++) {

          var user   = likerArray[i],
              avatar = Shelby.libs.User.avatarUrl(user);

          $el.append(SHELBYJST['liker-item']({
            avatar          : avatar,
            liker           : user,
            appropriatePath : appropriateSubdirectory
          }));
        }
      }
  });

});
