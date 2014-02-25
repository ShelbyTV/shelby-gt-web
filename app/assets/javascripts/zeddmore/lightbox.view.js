$(function(){
  Zeddmore.LightboxView = Backbone.View.extend({
    options: {
      //config
      embedContainer: '.js-playback-frame',
      iframeTemplate: '<iframe height="360" frameborder="0" src="http://www.youtube.com/embed/__ID__" width="640"></iframe>',
      //constant
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
        _media = this.options.iframeTemplate.replace('__ID__',this.model.get('provider_id')); //lo-fi interpolatin
      } else {
        //otherwise, use formatted embed
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

