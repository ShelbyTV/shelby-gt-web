libs.shelbyGT.ViewedVideosModel = libs.shelbyGT.ShelbyBaseModel.extend({

  relations : [{
    type : Backbone.HasMany,
    key : 'viewed_videos',
    relatedModel : 'libs.shelbyGT.VideoModel',
    collectionType : 'libs.shelbyGT.VideosCollection'
  }],

  parse : function(response) {  
    return ({viewed_videos: response.result || []});
  },

  url : shelby.config.apiRoot+'/video/viewed'
    
});
