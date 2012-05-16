libs.shelbyGT.RollListView = libs.shelbyGT.ListView.extend({

  className : /*libs.shelbyGT.ListView.prototype.className +*/ 'rolls-list js-rolls-list',

  options : _.extend({}, libs.shelbyGT.ListView.prototype.options, {
    collectionAttribute : 'roll_followings',
    listItemView : 'RollItemView'
  }),

  initialize : function() {
      shelby.models.guide.bind('change:tryAutoScroll', this._scrollToActiveRollItemView, this);
      libs.shelbyGT.ListView.prototype.initialize.call(this);
  },

  _cleanup : function() {
      shelby.models.guide.unbind('change:tryAutoScroll', this._scrollToActiveRollItemView, this);
      libs.shelbyGT.ListView.prototype._cleanup.call(this);
  },

  _scrollToActiveRollItemView : function(guideModel, tryAutoScroll) {
    if (tryAutoScroll) {
      var activeRollItemView = this.children.find(function(childView){
        var activeFrameModel = guideModel.get('activeFrameModel');
        if (activeFrameModel) {
          var roll = activeFrameModel.get('roll');
          if (roll && childView.model.id == roll.id) {
            return true;
          }
        }
      });
      if (activeRollItemView) {
        this._scrollTo(activeRollItemView.el);
      }
      guideModel.set('tryAutoScroll', false);
    }
  },

  _scrollTo : function(element) {
    this.parent.scrollToChildElement(element);
  }

});