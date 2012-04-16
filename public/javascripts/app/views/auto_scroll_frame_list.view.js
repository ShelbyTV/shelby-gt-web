( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;

  libs.shelbyGT.AutoScrollFrameListView = ListView.extend({

    initialize : function() {
      shelby.models.guide.bind('change:activeFrameModel', this._onNewActiveFrame, this);
      ListView.prototype.initialize.call(this);
    },

    _cleanup : function(){
      shelby.models.guide.unbind('change:activeFrameModel', this._onNewActiveFrame, this);
      ListView.prototype._cleanup.call(this);
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
