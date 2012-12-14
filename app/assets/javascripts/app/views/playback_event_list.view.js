libs.shelbyGT.PlaybackEventListView = libs.shelbyGT.ListView.extend({

  tagName : 'ol',

  options : _.extend({}, libs.shelbyGT.ListView.prototype.options, {
      collectionAttribute : 'events',
      doStaticRender : true
  }),

  initialize : function() {
    _(this.options).extend({
      listItemView : function(playbackEvent, params, index){
          params = _.extend({}, params);
          switch (playbackEvent.get('event_type')) {
            case libs.shelbyGT.PlaybackEventModelTypes.popup :
              return new libs.shelbyGT.PlaybackEventListItemView(_(params).extend({
                model : playbackEvent,
                index : index
              }));
            default :
              return null;
          }
      }
    });
    libs.shelbyGT.ListView.prototype.initialize.call(this);
  },

  _filter : function(event) {
    var eventType = event.get('event_type');
    return eventType && eventType == libs.shelbyGT.PlaybackEventModelTypes.popup;
  }

});