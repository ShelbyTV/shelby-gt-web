libs.shelbyGT.QueuedVideosModel = libs.shelbyGT.ShelbyBaseModel.extend({

  relations : [{
    type : Backbone.HasMany,
    key : 'queued_videos',
    relatedModel : 'libs.shelbyGT.VideoModel',
    collectionType : 'libs.shelbyGT.VideosCollection'
  }],

  parse : function(response) {
    return ({queued_videos: response.result || []});
  },

  url : shelby.config.apiRoot+'/video/queued',

  videoIsInQueue : function(video){
    return this.get('queued_videos').some(function(_video){
      return (video.get('id')===_video.get('id') ||
          (video.get('isSearchResultVideo') && video.get('provider_id') == _video.get('provider_id') && video.get('provider_name') == _video.get('provider_name')));
    });
  }
    
});