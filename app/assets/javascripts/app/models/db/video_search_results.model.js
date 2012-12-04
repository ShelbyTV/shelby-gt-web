libs.shelbyGT.VideoSearchResultsModel = libs.shelbyGT.ShelbyBaseModel.extend({

  providerName : 'generic',

  relations : [{
    type : Backbone.HasMany,
    key : 'videos',
    relatedModel : 'libs.shelbyGT.VideoModel',
    collectionType : 'libs.shelbyGT.VideosCollection'
  }],

  parse : function(response) {
    return ({videos: response.result.videos || []});
  },

  url : shelby.config.apiRoot+'/video/search',

  //evenly distribute the items along a number line of scores from 0 to 1
  assignScores : function() {
    var self = this;
    var videos = this.get('videos');
    var numVideos = videos.length;
    
    videos.each(function(video, index){
      video.set('score', index);
    });
  },

  getVideosWrappedInFrames : function() {
    return this.get('videos').map(function(video) {
      var idString = video.get('provider_name') + ":" + video.get('provider_id');
      video.id = idString;
      return new libs.shelbyGT.FrameModel({
        id : video.id,
        video : video
      });
    });
  }

});
