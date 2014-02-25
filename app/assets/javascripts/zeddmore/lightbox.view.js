$(function(){
  Zeddmore.LightboxView = Backbone.View.extend({
    options: {
      embedContainer: '.js-playback-frame',
      youtube: 'youtube'
    },
    events: {
      'click .js-close' : '_closeLightbox'
    },
    template: function(data){
      return SHELBYJST['lightbox-frame'](data);
    },
    initialize: function(){
      var _media;

      if(this.model.get('provider_name') == this.options.youtube) {
        //construct iframe if youtube
        _media = '<iframe height="360" frameborder="0" src="http://www.youtube.com/embed/'+this.model.get('provider_id')+'" width="640"></iframe>';
      } else {
        _media = this.model.get('embed_url');
      }

      var data = this.template({
        embed: _media,
        video: this.model
      });

      this.$el.find(this.options.embedContainer).html(data);
      this.$el.removeClass('hidden');
    },
    _closeLightbox: function(e){
      e.preventDefault();
      this.$el.find(this.options.embedContainer).children().remove();
      this.$el.addClass('hidden');
    }
  });
});

