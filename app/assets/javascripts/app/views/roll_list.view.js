libs.shelbyGT.RollListFilterType = {
  me : "me",
  following : "following"
};

libs.shelbyGT.RollListView = libs.shelbyGT.SmartRefreshListView.extend({

  className : 'list_module guide-list',

  options : _.extend({}, libs.shelbyGT.SmartRefreshListView.prototype.options, {
    collectionAttribute : 'rolls',
    doCheck : libs.shelbyGT.SmartRefreshCheckType.binarySearch,
    doSmartRefresh : true,
    listItemView : 'RollItemRollView',
    listItemViewAdditionalParams : function() {
      return {activationStateModel:shelby.models.guide};
    },
    sortAttribute : shelby.config.db.rollFollowings.sortAttribute,
    sortDirection : shelby.config.db.rollFollowings.sortDirection,
    rollListFilterType : null
  }),

  initialize : function() {
      libs.shelbyGT.ListView.prototype.initialize.call(this);
  },

  _cleanup : function() {
      libs.shelbyGT.ListView.prototype._cleanup.call(this);
  },

  _filter : function(roll) {
    var rollListFilterSatisfied = true;
    if (this.options.rollListFilterType == libs.shelbyGT.RollListFilterType.following) {
      rollListFilterSatisfied = roll.get('creator_id') != shelby.models.user.id;
    } else if (this.options.rollListFilterType == libs.shelbyGT.RollListFilterType.me) {
      rollListFilterSatisfied = roll.get('creator_id') == shelby.models.user.id;
    }
    return rollListFilterSatisfied &&
           roll.get('roll_type') != libs.shelbyGT.RollModel.TYPES.special_public &&
           roll.get('roll_type') != libs.shelbyGT.RollModel.TYPES.special_roll &&
           roll.id != shelby.models.user.get('watch_later_roll_id');
  },

  _scrollTo : function(element) {
    this.parent.scrollToChildElement(element);
  }

});