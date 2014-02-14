  var GuideView = Backbone.View.extend({
  options: {
    sources : { bookmarklet: 'bookmarklet', shares: 'shares'},
  },
  el: $('.js-guide'),
  initialize: function(){
    var self         = this,
        interactions = this.$el.find('.frame_interactions');

    _(interactions).each(function(el,index){
      new FrameInteraction({
        el     : el,
        user   : User,
        source : $('body').hasClass('shelby--radar') ? self.options.sources.bookmarklet : self.options.sources.share
      });
    });
  }
});
