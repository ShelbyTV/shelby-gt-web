$(function(){
  Zeddmore.LightboxView = Backbone.View.extend({
    options: {
      embedContainer: '.js-playback-frame'
    },
    events: {
      'click .js-close' : '_closeLightbox'
    },
    initialize: function(){
      this.$el.find(this.options.embedContainer).html(this.model.get('embed_url'));
      this.$el.removeClass('hidden');
    },
    _closeLightbox: function(e){
      e.preventDefault();
      this.$el.find(this.options.embedContainer).children().remove();
      this.$el.addClass('hidden');
    }
  });
});

