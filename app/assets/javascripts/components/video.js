$(function(){
  Shelby.VideoModel = Backbone.Model.extend({
    composeKnownUrl : function () {
      var knownUrl = "",
          providerName = this.get('provider_name'),
          videoId = this.get('provider_id');

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

  Shelby.VideoView = Backbone.View.extend({
    //things that a Video, Frame, or DashboardEntry can do.
    events: {
      'click .js-toggle-comment' : '_toggleComment'
    },
    initialize: function(){
      console.log('init video', this);
    },
    _cleanup: function(){},
    render: function(){},
    _toggleComment: function(e){
      e.preventDefault();

      console.log('toggleComment');

      var $button = $(e.currentTarget);
      $button.toggleClass('line-clamp--open', !$button.hasClass('line-clamp--open'));
    }
  });

});
