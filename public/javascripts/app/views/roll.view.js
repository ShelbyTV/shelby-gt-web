( function(){

  // shorten names of included library prototypes
  var FramePlayPagingListView = libs.shelbyGT.FramePlayPagingListView;

  libs.shelbyGT.RollView = FramePlayPagingListView.extend({

    className : FramePlayPagingListView.prototype.className + ' roll',

    initialize : function(){
      FramePlayPagingListView.prototype.initialize.call(this);
    },

    options : _.extend({}, FramePlayPagingListView.prototype.options, {
      collectionAttribute : 'frames',
      listItemView : 'FrameView',
      fetchParams : {
        include_children : true
      }
    }),

    _doesResponseContainListCollection : function(response) {
      return response.result.frames;
    },

    _doesListItemMatchFrame : function(itemModel, activeFrameModel) {
      return itemModel.id == activeFrameModel.id;
    }

  });

} ) ();
