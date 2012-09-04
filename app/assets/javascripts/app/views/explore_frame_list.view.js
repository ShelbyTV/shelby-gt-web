libs.shelbyGT.ExploreFrameListView = libs.shelbyGT.ListView.extend({

  tagName : 'ol',

  className: 'explore-list explore-roll-list clearfix',

  options : _.extend({}, libs.shelbyGT.ListView.prototype.options, {
      collectionAttribute : 'frames',
      doDynamicRender : false, // we don't want to show more than three frames even if other activities in the app
                               // fetch more frames for this roll later
      doStaticRender : true,
      listItemView : 'ExploreFrameItemView',
      listItemViewAdditionalParams : {roll:this.model}
  }),

  _filter : function(frame) {
    return frame.has('video') && frame.get('video').get('thumbnail_url');
  }

});