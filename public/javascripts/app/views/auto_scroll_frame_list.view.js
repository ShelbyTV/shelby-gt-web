( function(){

  // shorten names of included library prototypes
  var PagingListView = libs.shelbyGT.PagingListView;

  libs.shelbyGT.AutoScrollFrameListView = PagingListView.extend({

    initialize : function() {
      shelby.models.guide.bind('change:activeFrameModel', this._onNewActiveFrame, this);
      shelby.models.autoScrollState.bind('change:tryAutoScroll', this._scrollToActiveFrameView, this);
      PagingListView.prototype.initialize.call(this);
    },

    _cleanup : function(){
      shelby.models.guide.unbind('change:activeFrameModel', this._onNewActiveFrame, this);
      shelby.models.autoScrollState.unbind('change:tryAutoScroll', this._scrollToActiveFrameView, this);
      PagingListView.prototype._cleanup.call(this);
    },

    internalAddOne : function(item){
      try {
        PagingListView.prototype.internalAddOne.call(this, item);
      } catch (error) {
				// We are not loading G. Analytics in development env so just log to console.
				if(typeof(_gaq)!=="undefined" && _gaq.push){
				  _gaq.push(['_trackEvent', 'Errors', 'AutoScrollFrameListView.internalAddOne', error.message]);
				} else {
				  console.log("ERROR:", error.message, error.stack);
				}
      }
    },

    activateFrameRollingView : function(frame) {
      var playingFrameView = this.children.find(this._findViewByModel(frame));
      if (playingFrameView) {
        playingFrameView.requestFrameRollView();
        return true;
      } else {
        return false;
      }
    },

    _scrollToActiveFrameView : function(autoScrollStateModel, tryAutoScroll) {
      if (tryAutoScroll) {
        var activeFrameView = this.children.find(this._findViewByModel(shelby.models.guide.get('activeFrameModel')));
        if (activeFrameView) {
          this._scrollTo(activeFrameView.el);
        }
        shelby.models.autoScrollState.set('tryAutoScroll', false);
      }
    },

    _onNewActiveFrame : function(guideModel, currentActiveFrameModel){
      var currentActiveFrameView = this.children.find(this._findViewByModel(currentActiveFrameModel));
      if(currentActiveFrameView) {
        this._scrollTo(currentActiveFrameView.el);
      }
    },

    _scrollTo : function(element) {
      this.parent.scrollToChildElement(element);
    },

    //ListView overrides
    _listItemViewAdditionalParams : function() {
      return {activationStateModel:shelby.models.guide};
    }

  });

} ) ();
