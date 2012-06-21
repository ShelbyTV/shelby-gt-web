( function(){

  // shorten names of included library prototypes
  var PagingListView = libs.shelbyGT.PagingListView;

  libs.shelbyGT.RollView = PagingListView.extend({

    className : PagingListView.prototype.className + ' roll',

    initialize : function(){
      this._initInfiniteScrolling();
      PagingListView.prototype.initialize.call(this);
    },

    options : _.extend({}, PagingListView.prototype.options, {
      collectionAttribute : 'frames',
      listItemView : 'FrameView',
      fetchParams : {
        include_children : true
      }
    }),

    _doesResponseContainListCollection : function(response) {
      return response.result.frames;
    },
    
    //ListView overrides
    _listItemViewAdditionalParams : function() {
      return {activationStateModel:shelby.models.guide};
    }

  });

} ) ();
