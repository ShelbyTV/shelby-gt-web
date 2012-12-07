libs.shelbyGT.ytUtils = {
  frameModelFromYtJson : function(ytJson) {
    return new libs.shelbyGT.FrameModel({
      video : this.videoModelFromYtJson(ytJson)
    });
  },

  videoModelFromYtJson : function(ytJson) {
    return new libs.shelbyGT.VideoModel({
      provider_id : ytJson.media$group.yt$videoid.$t,
      provider_name : 'youtube',
      thumbnail_url : this._getVideoThumbnailUrl(ytJson),
      title : ytJson.title.$t
    });
  },

  _getVideoThumbnailUrl : function(ytJson) {
    var url = null;
    ytJson.media$group.media$thumbnail.forEach(function(thumb){
      if (thumb.height==360){
        url = thumb.url;
      }
    });
    return url;
  }
};
