( function(){

  // shorten names of included library prototypes
  var AutoScrollFrameListView = libs.shelbyGT.AutoScrollFrameListView;

  libs.shelbyGT.RollView = AutoScrollFrameListView.extend({

    className : AutoScrollFrameListView.prototype.className + ' roll',

    options : _.extend({}, AutoScrollFrameListView.prototype.options, {
      collectionAttribute : 'frames',
      listItemView : 'FrameView',
      fetchParams : {
        include_children : true
      }
    })

  });

} ) ();