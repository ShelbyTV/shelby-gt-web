libs.shelbyGT.RollListFilterType = {
  me : "me",
  following : "following",
  chat : "chat"
};

libs.shelbyGT.RollListView = libs.shelbyGT.ListView.extend({

  className : 'list_module guide-list',

  options : _.extend({}, libs.shelbyGT.SmartRefreshListView.prototype.options, {
    collectionAttribute : 'rolls',
    listItemView : 'RollItemView',
    listItemViewAdditionalParams : function() {
      return {activationStateModel:shelby.models.guide};
    },
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
      rollListFilterSatisfied = roll.get('creator_id') != shelby.models.user.id &&
        roll.get('roll_type') != libs.shelbyGT.RollModel.TYPES.user_discussion_roll;
    } else if (this.options.rollListFilterType == libs.shelbyGT.RollListFilterType.me) {
      rollListFilterSatisfied = roll.get('creator_id') == shelby.models.user.id &&
        roll.get('roll_type') != libs.shelbyGT.RollModel.TYPES.user_discussion_roll;
    } else if (this.options.rollListFilterType == libs.shelbyGT.RollListFilterType.chat) {
      rollListFilterSatisfied = roll.get('roll_type') == libs.shelbyGT.RollModel.TYPES.user_discussion_roll;
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