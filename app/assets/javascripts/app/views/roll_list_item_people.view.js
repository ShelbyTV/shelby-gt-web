libs.shelbyGT.RollItemPeopleView = libs.shelbyGT.RollItemView.extend({

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'activeFrameModel'
  }),

  // RollItemView overrides

  _setupEvents : function() {
    return (
      {
        "click .js-roll-item-button" : "goToRoll"
      }
    );
  },

  _renderTemplate : function(obj) {
   return JST['roll-item-people'](obj);
  }
});
