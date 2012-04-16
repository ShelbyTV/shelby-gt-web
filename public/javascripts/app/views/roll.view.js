( function(){

  // shorten names of included library prototypes
  var AutoScrollFrameListView = libs.shelbyGT.AutoScrollFrameListView;

  libs.shelbyGT.RollView = AutoScrollFrameListView.extend({

    className : AutoScrollFrameListView.prototype.className + ' roll',

    initialize : function(){
      _(this.options).extend({
        collectionAttribute : 'frames',
        listItemView : 'FrameView',
        fetchParams : {
          include_children : true
        }
      });
      AutoScrollFrameListView.prototype.initialize.call(this);
    }

  });

} ) ();