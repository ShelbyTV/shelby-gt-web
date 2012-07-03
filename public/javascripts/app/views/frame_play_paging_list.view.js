( function(){

  // shorten names of included library prototypes
  var PagingListView = libs.shelbyGT.PagingListView;

  libs.shelbyGT.FramePlayPagingListView = PagingListView.extend({

    options : _.extend({}, libs.shelbyGT.PagingListView.prototype.options, {
      infinite: true
    }),

    initialize : function(){
      shelby.models.guide.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      PagingListView.prototype.initialize.call(this);
    },

    _cleanup : function(){
      shelby.models.guide.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      PagingListView.prototype._cleanup.call(this);
    },

    render : function(forceReRender){
      PagingListView.prototype.render.call(this, forceReRender);
      this._loadMoreWhenLastItemActive();
    },

    _onActiveFrameModelChange : function(guideModel, activeFrameModel){
      this._loadMoreWhenLastItemActive();
    },

    _loadMoreWhenLastItemActive : function(){
      var activeFrameModel = shelby.models.guide.get('activeFrameModel');
      if (activeFrameModel) {
        // if we're playing the final frame in the list, load some more if they are available
        // so they're ready to go when this frame finishes
        if (this._loadMoreEnabled) {
          var lastItem = this._displayCollection.last();
          if (lastItem && this._doesListItemMatchFrame(lastItem, activeFrameModel)) {
            this._loadMore();
          }
        }
      }
    },

    _doesListItemMatchFrame : function(itemModel, activeFrameModel) {
      // subclasses must override to specify how to know when a given list item
      // matches the active frame model
      console.log('Sorry, your FramePlayPagingListView subclass must override _doesListItemMatchFrame');
    },

    _onItemsLoaded : function(rollModel, items){
      PagingListView.prototype._onItemsLoaded.call(this, rollModel, items);
      this._loadMoreWhenLastItemActive();
    },

    //ListView overrides
    _listItemViewAdditionalParams : function() {
      return {activationStateModel:shelby.models.guide};
    }

  });

} ) ();