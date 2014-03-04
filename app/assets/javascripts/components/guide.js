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

      _(media).each(function(el){
        self._initVideocard(el,{source: self.options.source});
      });

    },

    _initVideocard: function(el,opts){
      new Shelby.FrameView({
        el     : el,
        user   : Shelby.User,
        source : opts.source
      });
    },

    _getDisplayState : function(){
      return $('body').hasClass('shelby--radar') ? this.options.sources.bookmarklet : this.options.sources.shares;
    }
  });



  //Mobile Web (!SharePages && !Bookmarklet) requires more functionality,
  //below is augmentation of above.

  Shelby.MobileGuideView = Shelby.GuideView.extend({
    events: _.extend({},Shelby.GuideView.prototype.events,{
      'click .js-load-more' : 'loadMore'
    }),

    loadMore: function(e){
      e.preventDefault();

      var self = this,
          $this = $(e.target).addClass('button_busy'),
          $guideList = $('.js-list');

      window.setTimeout(function() {
        $.get($this.attr('href'), function(data) {
          $this.removeClass('button_busy');

          var $items  = $(data).find('.js-list').children('.list__item'),
              $button = $(data).find('.js-load-more');

          // $('.js-list').append($items);

          $items.each(function(index,el){
            $guideList.append(el);

            //note: el.children == <article>, which is the true "el" for the view.
            self._initVideocard(el.children,{source: self.options.source});
          });

          $('.js-load-more').attr('href', $button.attr('href'));
        });
      }, 100);
    }
  });

});
