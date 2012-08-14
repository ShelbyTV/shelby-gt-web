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
    var res = false;
    this.get('queued_videos').forEach(function(_video){
      if (video.get('id')===_video.get('id')){
        res = true;
      }
    });
    return res;
  }
    
});
