libs.shelbyGT.ExploreFrameListView = libs.shelbyGT.ListView.extend({

  tagName : 'ol',

  className: 'explore-list explore-roll-list clearfix',

  options : _.extend({}, libs.shelbyGT.ListView.prototype.options, {
      collectionAttribute : 'frames',
      doDynamicRender : false, // we don't want to show more than three frames even if other activities in the app
                               // fetch more frames for this roll later
      doStaticRender : true
  }),

  initialize : function() {
    _(this.options).extend({
      displayCollection : new libs.utils.UniqueCollection(null, {
        uniquenessValue : function(item){
          var video = item.get('video');
          if (video) {
            return 'videoid:' + item.get('video').id;
          } else {
            return 'frameid:' + item.id;
          }
        },
        maxDisplayedItems : 3
      }),
      listItemView : function(item, params){
          params = _.extend({}, params, {
            className : 'explore-roll-item',
            roll : this.model
          });
          return new libs.shelbyGT.ExploreFrameItemView(_(params).extend({model:item}));
      }
    });
    libs.shelbyGT.ListView.prototype.initialize.call(this);
  },

  _filter : function(frame) {
    var video = frame.get('video');
    return video && video.get('thumbnail_url') && (!Browser.isMobile() || video.canPlayMobile());
  }

});