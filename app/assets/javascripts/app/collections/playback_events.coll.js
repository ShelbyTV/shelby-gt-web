libs.shelbyGT.PlaybackEventsCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.PlaybackEventModel,

  initialize : function(models, options) {
    this.comparator = function(playbackEvent) {
      return playbackEvent.get('start_time');
    };
  }
  
});
