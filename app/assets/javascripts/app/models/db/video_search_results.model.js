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
      video.set('score', index * 10);
    });
  },

  //same as assignScores, except pushes videos whose titles contain none of the words
  //in the query further down in the sort order
  //this is used to deprioritize Vimeo videos that come up when words in the query
  //matched largely irrelevant stuff in the video description
  assignScoresPrioritizeTitleMatch : function(query) {
    var self = this;
    var videos = this.get('videos');
    var numVideos = videos.length;
    var queryTerms = query.replace(/\s+/ig,' ').split(' ');

    videos.each(function(video, index){
      var titleContainsQueryTerm = false;
      var title = video.get('title');
      var i = 0;

      //check if the video's title contains any of the words in the query
      while (!titleContainsQueryTerm && i < queryTerms.length) {
        if (new RegExp(queryTerms[i], "i").test(title)) {
          titleContainsQueryTerm = true;
        }
        i++;
      }
      if (titleContainsQueryTerm) {
        video.set('score', index * 10);
      } else {
        //if not, push it further down the list
        video.set('score', 100000 + index);
      }
    });
  },

  getVideosWrappedInFrames : function() {
    return this.get('videos').map(function(video) {
      var idString = video.get('provider_name') + ":" + video.get('provider_id');
      video.set({
        id : idString,
        isSearchResultVideo : true
      });
      return new libs.shelbyGT.FrameModel({
        id : video.id,
        video : video,
        conversation : {
          messages : [
            {
              text : video.get('description')
            }
          ]
        },
        isSearchResultFrame : true
      });
    });
  }

});
