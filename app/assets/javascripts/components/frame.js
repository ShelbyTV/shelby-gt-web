//Frame Model is extended by Video Model.
$(function(){
  Shelby.FrameModel = Shelby.VideoModel.extend({
    composeKnownUrl : function () {
      var knownUrl = "",
          providerName = this.get('video').provider_name,
          videoId = this.get('video').provider_id;

      switch (providerName) {
        case 'blip':
          knownUrl = "http://blip.tv/episode/" + videoId;
          break;
        case 'youtube':
          knownUrl = "http://www.youtube.com/watch?v=" + videoId;
          break;
        case 'dailymotion':
          knownUrl = "http://www.dailymotion.com/video/" + videoId + "?";
          break;
        case 'vimeo':
          knownUrl = "http://vimeo.com/" + videoId;
          break;
        case 'techcrunch':
          knownUrl = "http://techcrunch.tv/watch?id=" + videoId;
          break;
        case 'collegehumor':
          // knownUrl = (opts.useUrl) ? document.location.href : knownUrl = "http://collegehumor.com/video/" + videoId;
          knownUrl = "http://collegehumor.com/video/" + videoId;
          break;
        case 'hulu':
          //HACK (For now).
          // the videoId is the content_id, not useful when hitting embedly or our link cache
          // so using the page location for now
          knownUrl = document.location.href;
          break;
        case 'bloomberg':
          //HACK (For now).
          // so using the page location + the provider id
          knownUrl = document.location.href + "?bloomberg_ooyala_id="+ videoId;
          break;
        default:
          knownUrl = false;
      }

      return knownUrl;
    }
  });

  Shelby.FrameView = Shelby.VideoView.extend({
    // things that Frame or DashboardEntry could to, but that a Video can't do.
    options: {
      containerSelector: '.frame_interactions'
    },
    initialize: function(){
      var interaction = this.$el.find(this.options.containerSelector);

        new Shelby.FrameInteraction({
          el     : this.el,
          user   : Shelby.User,
          source : this.options.source
        });
    }
  });
});
