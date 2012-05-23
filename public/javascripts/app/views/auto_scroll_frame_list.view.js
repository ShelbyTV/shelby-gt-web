( function(){

  // shorten names of included library prototypes
  var PagingListView = libs.shelbyGT.PagingListView;

  libs.shelbyGT.AutoScrollFrameListView = PagingListView.extend({

    initialize : function() {
      shelby.models.guide.bind('change:activeFrameModel', this._onNewActiveFrame, this);
      shelby.models.guide.bind('change:activeFrameRollingView', this._onNewActiveFrameRollingView, this);
      shelby.models.guide.bind('change:tryAutoScroll', this._scrollToActiveFrameView, this);
      PagingListView.prototype.initialize.call(this);
    },

    _cleanup : function(){
      shelby.models.guide.unbind('change:activeFrameModel', this._onNewActiveFrame, this);
      shelby.models.guide.unbind('change:activeFrameRollingView', this._onNewActiveFrameRollingView, this);
      shelby.models.guide.unbind('change:tryAutoScroll', this._scrollToActiveFrameView, this);
      PagingListView.prototype._cleanup.call(this);
    },

    internalAddOne : function(item){
      try {
        PagingListView.prototype.internalAddOne.call(this, item);
      } catch (error) {
				// We are not loading G. Analytics in development env so just log to console.
				try { _gaq.push(['_trackEvent', 'Errors', 'AutoScrollFrameListView.internalAddOne', e.message]); }
				catch(e) {
          console.log("_gaq not loaded in development env:", error.message);
        }
      }
    },

    activateFrameRollingView : function(frame) {
      var playingFrameView = this.children.find(this._findViewByModel(frame));
      if (playingFrameView) {
        this.parent.$el.scrollTo(playingFrameView.$el, {duration:200,axis:'y',onAfter:function(){
          playingFrameView.RequestFrameRollingView();
        }});
        return true;
      } else {
        return false;
      }
    },

    _scrollToActiveFrameView : function(guideModel, tryAutoScroll) {
      if (tryAutoScroll) {
        var activeFrameView = this.children.find(this._findViewByModel(shelby.models.guide.get('activeFrameModel')));
        if (activeFrameView) {
          this._scrollTo(activeFrameView.el);
        }
        guideModel.set('tryAutoScroll', false);
      }
    },

    _onNewActiveFrame : function(guideModel, currentActiveFrameModel){
      var currentActiveFrameView = this.children.find(this._findViewByModel(currentActiveFrameModel));
      if(currentActiveFrameView) {
        this._scrollTo(currentActiveFrameView.el);
      }
    },

    _onNewActiveFrameRollingView : function(guideModel, currentActiveFrameRollingView){
      // a bit ugly
      this.parent.scrollToChildElement($(currentActiveFrameRollingView.el).parent().parent());
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
