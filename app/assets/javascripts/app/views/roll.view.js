( function(){

  // shorten names of included library prototypes
  var FramePlayPagingListView = libs.shelbyGT.FramePlayPagingListView;

  libs.shelbyGT.RollView = FramePlayPagingListView.extend({

    frameGroupCollection : null,

    className : FramePlayPagingListView.prototype.className + ' roll',

    initialize : function(){
      this.frameGroupCollection = new libs.shelbyGT.FrameGroupsCollection();
      _(this.options).extend({
        displayCollection: this.frameGroupCollection
      });

      FramePlayPagingListView.prototype.initialize.call(this);
    },

    options : _.extend({}, FramePlayPagingListView.prototype.options, {
      collectionAttribute : 'frames',
      listItemView : 'FrameGroupView',
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
