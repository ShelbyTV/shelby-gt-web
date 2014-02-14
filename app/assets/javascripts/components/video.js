var VideoModel = Backbone.Model.extend({
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
