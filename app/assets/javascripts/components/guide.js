$(function() {
    Shelby.GuideView = Backbone.View.extend({
        options: {
            sources: {
                bookmarklet: 'bookmarklet',
                shares: 'shares'
            }
        },
        el: $('.js-guide'),
        initialize: function() {
            var self = this,
                media = this.$el.find('.js-frame');

            this.options.source = this._getDisplayState();

            _(media).each(function(el, index) {
                self._initVideocard(el, index, {
                    source: self.options.source
                });
            });
        },

        _initVideocard: function(el, index, opts) {
            new Shelby.FrameView({
                el: el,
                index: index,
                source: opts.source,
                user: Shelby.User
            });
        },

        _getDisplayState: function() {
            var _state,
                $body = $('body');

            if ($body.hasClass('shelby--radar') || $body.hasClass('shelby--mobile-video-search')) {
                _state = this.options.sources.bookmarklet;
            } else {
                _state = this.options.sources.shares
            }
            return _state;
        }
    });


    //Mobile Web (!SharePages && !Bookmarklet) requires more functionality,
    //below is augmentation of above.

    Shelby.MobileGuideView = Shelby.GuideView.extend({
        options: _.extend({}, Shelby.GuideView.prototype.options, {
            page: 10
        }),

        events: _.extend({}, Shelby.GuideView.prototype.events, {
            'click .js-load-more': 'loadMore'
        }),

        loadMore: function(e) {
            e.preventDefault();

            var self = this,
                $this = $(e.target).addClass('button_busy'),
                $guideList = $('.js-list');

            window.setTimeout(function() {
                $.get($this.attr('href'), function(data) {
                    self.options.page += 1;

                    $this.removeClass('button_busy');

                    var $items = $(data).find('.js-list').children('.list__item'),
                        $button = $(data).find('.js-load-more');

                    // $('.js-list').append($items);

                    $items.each(function(index, el) {
                        $guideList.append(el);

                        //note: el.children == <article>, which is the true "el" for the view.
                        self._initVideocard(el.children, (index * self.options.page), {
                            source: self.options.source
                        });
                    });

                    $('.js-load-more').attr('href', $button.attr('href'));
                });
            }, 100);
        }
    });

});
