libs.shelbyGT.RollItemRollView = libs.shelbyGT.RollItemView.extend({

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
    activationStateProperty : 'activeFrameModel'
  }),

  // RollItemView overrides

  _setupEvents : function() {
    return (
      {
        "click .js-roll-item-button"          : "goToRoll",
        "click .roll-item-stats"              : "goToRoll",
        "click .roll-item-contents-thumbnail" : "goToRoll",
        "click .js-roll-item-unfollow"        : "unfollowRoll"
      }
    );
  },

  _renderTemplate : function(obj) {
   return JST['roll-item'](obj);
  }
});
