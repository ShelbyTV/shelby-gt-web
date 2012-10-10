libs.shelbyGT.RollItemView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
    activationStateProperty : 'activeFrameModel'
  }),

  events : {
    "click .js-roll-item-button"          : "goToRoll",
    "click .roll-item-stats"              : "goToRoll",
    "click .roll-item-contents-thumbnail" : "goToRoll",
    "click .js-roll-item-unfollow"        : "unfollowRoll"
  },

  className : 'list_item guide-item clearfix',

  template : function(obj){
    return SHELBYJST['roll-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({roll : this.model, options: this.options}));
    libs.shelbyGT.ActiveHighlightListItemView.prototype.render.call(this);
  },

  goToRoll : function(){
    shelby.router.navigateToRoll(this.model, {trigger:true});
  },

  unfollowRoll : function(data) {
    // immediately remove the roll following locally - if the ajax fails, we'll update the next time we render
    this.model.collection.remove(this.model);
    // now that we've shown the user that their action has succeeded, let's fire off the ajax to
    // actually do what they want, which will very likely succeed
    this.model.leaveRoll();
  },

  // override ActiveHighlightListItemView abstract method
  doActivateThisItem : function(guideModel){
    var activeFrameModel = guideModel.get('activeFrameModel');
    if (activeFrameModel) {
      var roll = activeFrameModel.get('roll');
      if (roll && this.model.id == roll.id) {
        return true;
      }
    }
    return false;
  }

});
