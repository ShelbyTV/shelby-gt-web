( function(){

  // shorten names of included library prototypes
  var PagingListView = libs.shelbyGT.PagingListView;

  libs.shelbyGT.FrameGroupPlayPagingListView = PagingListView.extend({

    frameGroupCollection : null,

    options : _.extend({}, libs.shelbyGT.PagingListView.prototype.options, {
      collapseViewedFrameGroups : true,
      infinite : true,
      listItemViewAdditionalParams : function() {
        return {activationStateModel:shelby.models.guide, guideOverlayModel:shelby.models.guideOverlay};
      }
    }),

    initialize : function(){
      this.frameGroupCollection = this.options.displayCollection =
        new libs.shelbyGT.FrameGroupsCollection([], {
          collapseViewedFrameGroups : this.options.collapseViewedFrameGroups
        });
      shelby.models.guide.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      PagingListView.prototype.initialize.call(this);
    },

    _cleanup : function(){
      this.frameGroupCollection._cleanup();
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
        // if we're playing the final playable frame group in the list, load some more if they are available
        // so they're ready to go when this frame finishes
        if (this.frameGroupCollection.isLastPlayableFrameGroup(activeFrameModel)) {
            this._loadMore();
        }
      }
    },

    _onItemsLoaded : function(rollModel, items){
      PagingListView.prototype._onItemsLoaded.call(this, rollModel, items);
      this._loadMoreWhenLastItemActive();
    }

  });

} ) ();