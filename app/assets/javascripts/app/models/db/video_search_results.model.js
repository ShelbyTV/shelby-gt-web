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
    this.get('videos').each(function(video, index){
      video.set('score', index);
    });
  },

  //same as assignScores, except pushes videos whose titles contain none of the words
  //in the query further down in the sort order
  //this is used to deprioritize Vimeo videos that come up when words in the query
  //matched largely irrelevant stuff in the video description
  assignScoresPrioritizeTitleMatch : function(query) {
    var queryTerms = query.replace(/\s+/ig,' ').split(' ');
    var nextIndexToFill = 0;

    this.get('videos').each(function(video, index){
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
        video.set('score', nextIndexToFill);
        //keep track of where we're supposed to be interleaving the next good video,
        //otherwise even good videos would get pushed one slot further down every time
        //we found an irrelevant video
        nextIndexToFill++;
      } else {
        //if no match in the title, push this video to the bottom of the list
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
