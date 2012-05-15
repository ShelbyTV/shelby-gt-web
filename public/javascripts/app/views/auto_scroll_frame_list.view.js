( function(){

  // shorten names of included library prototypes
  var PagingListView = libs.shelbyGT.PagingListView;

  libs.shelbyGT.AutoScrollFrameListView = PagingListView.extend({

    initialize : function() {
      shelby.models.guide.bind('change:activeFrameModel', this._onNewActiveFrame, this);
      shelby.models.guide.bind('change:activeFrameRollingView', this._onNewActiveFrameRollingView, this);
      PagingListView.prototype.initialize.call(this);
    },

    _cleanup : function(){
      shelby.models.guide.unbind('change:activeFrameModel', this._onNewActiveFrame, this);
      PagingListView.prototype._cleanup.call(this);
    },

    addOne : function(item){
      try {
        PagingListView.prototype.addOne.call(this, item);
      } catch (error) {
				// We are not loading G. Analytics in development env so just log to console.
				try { _gaq.push(['_trackEvent', 'Errors', 'AutoScrollFrameListView.addOne', e.message]); }
				catch(e) { console.log("_gaq not loaded in development env:", error.message); }
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

    scrollToActiveFrameView : function() {
      var activeFrameView = this.children.find(this._findViewByModel(shelby.models.guide.get('activeFrameModel')));
      if (activeFrameView) {
        this._scrollTo(activeFrameView.el);
      }
    },

    _onNewActiveFrame : function(guideModel, currentActiveFrameModel){
      var frameViews = this._getActiveFrameViews(guideModel, currentActiveFrameModel);
      this._switchActiveFrameViews(frameViews);
    },

    _onNewActiveFrameRollingView : function(guideModel, currentActiveFrameRollingView){
      // a bit ugly
      this.parent.scrollToChildElement($(currentActiveFrameRollingView.el).parent().parent());
    },

    _getActiveFrameViews : function(guideModel, currentActiveFrameModel){
      return {
        current : this.children.find(this._findViewByModel(currentActiveFrameModel)),
        old : this.children.find(this._findViewByModel(guideModel.previousAttributes().activeFrameModel))
      };
    },

    _switchActiveFrameViews : function(frameViews){
      frameViews.old && frameViews.old.$el.removeClass('active-frame');
      if(frameViews.current) {
        frameViews.current.$el.addClass('active-frame');
        this._scrollTo(frameViews.current.el);
      }
    },

    _scrollTo : function(element) {
      this.parent.scrollToChildElement(element);
    }

  });

} ) ();
