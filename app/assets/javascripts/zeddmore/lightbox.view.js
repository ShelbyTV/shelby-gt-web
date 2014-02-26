$(function(){
  Zeddmore.LightboxView = Backbone.View.extend({
    options: {
      //config
      embedContainer: '.js-playback-frame',
      iframeTemplate: '<iframe height="360" frameborder="0" src="http://www.youtube.com/embed/__ID__" width="640"></iframe>',
      providers: {
        youtube: 'youtube'
      }
    },
    events: {
      'click .js-close' : 'closeButton',
      'click .js-panel' : 'anywhereToClose'
    },
    template: function(data){
      return SHELBYJST['lightbox-frame'](data);
    },
    initialize: function(){
      this.model.bind('change',this.render,this);
      this.render();
    },
    _cleanup: function(){
      this.model.unbind('change',this.render,this);
    },
    render: function(){
      var _media;

      if(this.model.get('provider_name') == this.options.providers.youtube) {
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
    closeButton: function(e){
      e.preventDefault();
      this._closeLightbox();
    },
    anywhereToClose: function(e){
      if($(e.target).hasClass('js-panel')) {
        this._closeLightbox();
      }
    },
    _closeLightbox: function(){
      this.$el.find(this.options.embedContainer).children().remove();
      this.$el.addClass('hidden');
    }
  });
});

