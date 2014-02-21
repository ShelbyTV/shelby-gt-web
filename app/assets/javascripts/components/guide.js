$(function(){
  Shelby.GuideView = Backbone.View.extend({
    options: {
      sources : { bookmarklet: 'bookmarklet', shares: 'shares'}
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
});
