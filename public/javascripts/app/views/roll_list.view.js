libs.shelbyGT.RollListView = libs.shelbyGT.SmartRefreshListView.extend({

  className : 'rolls-list js-rolls-list',

  options : _.extend({}, libs.shelbyGT.SmartRefreshListView.prototype.options, {
    collectionAttribute : 'rolls',
    listItemView : 'RollItemView',
    doSmartRefresh : true
  }),

  initialize : function() {
      shelby.models.autoScrollState.bind('change:tryAutoScroll', this._scrollToActiveRollItemView, this);
      this._filterContent(shelby.models.guide.get('rollListContent'));
      libs.shelbyGT.ListView.prototype.initialize.call(this);
  },

  _cleanup : function() {
      shelby.models.autoScrollState.unbind('change:tryAutoScroll', this._scrollToActiveRollItemView, this);
      libs.shelbyGT.ListView.prototype._cleanup.call(this);
  },

  _scrollToActiveRollItemView : function(autoScrollStateModel, tryAutoScroll) {
    if (tryAutoScroll) {
      var activeFrameModel = shelby.models.guide.get('activeFrameModel');
      if (activeFrameModel) {
        var roll = activeFrameModel.get('roll');
        if (roll) {
          var activeRollItemView = this.children.find(function(childView){
              if (childView.model.id == roll.id) {
                return true;
              }
          });
          if (activeRollItemView) {
            this._scrollTo(activeRollItemView.el);
          }
        }
      }
      shelby.models.autoScrollState.set('tryAutoScroll', false);
    }
  },

  _filterContent : function(guidePresentationContent){
    switch(guidePresentationContent){
      case libs.shelbyGT.GuidePresentation.content.rolls.people:
        this.updateFilter(function(model){
          var creator_id = model.get('creator_id');
          return model.get('public') && !model.get('collaborative') && (!creator_id || creator_id != shelby.models.user.id);
        });
        break;
      case libs.shelbyGT.GuidePresentation.content.rolls.myRolls:
        this.updateFilter(function(model){
          var isNotPersonRoll = !model.get('public') || model.get('collaborative');
          var creator_id = model.get('creator_id');
          var isMyPublicRoll = model.get('public') && !model.get('collaborative') && creator_id && creator_id == shelby.models.user.id;
          return isNotPersonRoll || isMyPublicRoll;
        });
        break;
      case libs.shelbyGT.GuidePresentation.content.rolls.browse:
        this.updateFilter(null);
        break;
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