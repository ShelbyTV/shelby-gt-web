$(function(){
  Zeddmore.MenuView = Backbone.View.extend({
    events: {
      'click .js-open-item' : '_openItem'
    },
    _openItem: function(e){
      var $_item = $(e.currentTarget).siblings('.js-video-json');

          $_item = JSON.parse( $_item.html() );

      var model = new Zeddmore.VideoModel($_item);

      console.log('embed_url',model.get('embed_url'));

      Zeddmore.Lightbox = new Zeddmore.LightboxView({el: "#lightbox",model:model});
    }
  });
});
