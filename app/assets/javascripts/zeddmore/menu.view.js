$(function(){
  Zeddmore.MenuView = Backbone.View.extend({
    events: {
      'click .js-open-item' : '_openItem'
    },
    initialize: function(){
      Zeddmore.Video = new Zeddmore.VideoModel();
    },
    _openItem: function(e){
      var $_item = $(e.currentTarget).siblings('.js-video-json');

          $_item = JSON.parse( $_item.html() );

      var model = Zeddmore.Video.set($_item);

      Zeddmore.Lightbox = new Zeddmore.LightboxView({el: "#lightbox", model:model});
    }
  });
});
