libs.shelbyGT.FrameRecsView = Support.CompositeView.extend({

  _frame : null,

  options : {
    numThumbnailsDisplayed : 5, // the number of rec thumbnails to display
    selfBindAndUpdate : true // whether the view will bind to its model and dynamically update itself
                              // default is false, in which case updates must be handled by the parent
  },

  template : function(obj){
    return SHELBYJST['frame-actions-counts'](obj);
  },

  initialize : function() {
    if (this.options.selfBindAndUpdate) {
      this._frame = this.model.getFirstFrame();
      this._frame.bind('change:recommendations', this.render, this);
    }
  },

  _cleanup : function() {
    if (this.options.selfBindAndUpdate) {
      this._frame.unbind('change:recommendations', this.render, this);
    }
  },

  render : function(){
    // get frame recs
    if (this._frame) {

      var recommendedVideoCollection = this._frame.get('recommendations');
      var recsToDisplay = recommendedVideoCollection.models.slice(0, this.options.numThumbnailsDisplayed);

      this.$el.toggleClass('frame-likes--hide', recsToDisplay.length == 0);


      if (recsToDisplay.length && recsToDisplay.length > 0){
        this.$el.html(this.template({
          likers : recsToDisplay,
          remainingLikes : null
        }));

        // render the recommended video thumbnails, now if they've already arrived, or via event handling
        // later if the ajax hasn't returned yet
        recommendedVideoCollection.models = recommendedVideoCollection.models.slice(0, this.options.numThumbnailsDisplayed);

        this.renderChild(new libs.shelbyGT.ListView({
          collection : recommendedVideoCollection,
          doStaticRender : true,
          el : this.$('.js-liker-avatars-list'),
          listItemView : 'RecThumbnailItemView',
          listItemViewAdditionalParams : {
            actorDescription : 'recommendation',
            maxDisplayedItems : 3
          }
        }));
      }
    }

  }

});
