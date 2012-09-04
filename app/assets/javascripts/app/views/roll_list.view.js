libs.shelbyGT.RollListView = libs.shelbyGT.SmartRefreshListView.extend({

  className : 'list_module guide-list js-rolls-list',

  options : _.extend({}, libs.shelbyGT.SmartRefreshListView.prototype.options, {
    collectionAttribute : 'rolls',
    doCheck : libs.shelbyGT.SmartRefreshCheckType.binarySearch,
    doSmartRefresh : true,
    listItemView : 'RollItemRollView',
    listItemViewAdditionalParams : function() {
      return {activationStateModel:shelby.models.guide};
    },
    sortAttribute : shelby.config.db.rollFollowings.sortAttribute,
    sortDirection : shelby.config.db.rollFollowings.sortDirection
  }),

  initialize : function() {
      this._filterContent(shelby.models.guide.get('rollListContent'));
      libs.shelbyGT.ListView.prototype.initialize.call(this);
  },

  _cleanup : function() {
      libs.shelbyGT.ListView.prototype._cleanup.call(this);
  },

  _filterContent : function(guidePresentationContent){
    var self = this;
    
    switch(guidePresentationContent){
      case libs.shelbyGT.GuidePresentation.content.rolls.myRolls:
        this.updateFilter(function(model){
          return !self._isFauxUserPersonalRoll(model) &&
            model.id != shelby.models.user.get('watch_later_roll_id');
        });
        break;
    }
  },
  
  _isFauxUserPersonalRoll : function(roll) {
    return roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_public ||
           roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_roll;
  },

  _scrollTo : function(element) {
    this.parent.scrollToChildElement(element);
  }

});