( function(){

  // shorten names of included library prototypes
  var AutoScrollFrameListView = libs.shelbyGT.AutoScrollFrameListView;

  libs.shelbyGT.RollView = AutoScrollFrameListView.extend({

    className : AutoScrollFrameListView.prototype.className + ' roll',

    initialize : function(){
      this.options.collectionAttribute = 'frames';
      this.options.listItemView = 'FrameView';
      AutoScrollFrameListView.prototype.initialize.call(this);
    },

  });

} ) ();