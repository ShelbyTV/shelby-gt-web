( function(){

  // shorten names of included library prototypes
  var AutoScrollFrameListView = libs.shelbyGT.AutoScrollFrameListView;

  libs.shelbyGT.RollView = AutoScrollFrameListView.extend({

    className : AutoScrollFrameListView.prototype.className + ' roll',

    initialize : function(){
      this._initInfiniteScrolling();
      AutoScrollFrameListView.prototype.initialize.call(this);
    },

    options : _.extend({}, AutoScrollFrameListView.prototype.options, {
      collectionAttribute : 'frames',
      listItemView : 'FrameView',
      fetchParams : {
        include_children : true
      }
    }),

    _doesResponseContainListCollection : function(response) {
      return response.result.frames;
    }

  });

} ) ();
