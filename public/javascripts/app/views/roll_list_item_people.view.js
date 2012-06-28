libs.shelbyGT.RollItemPeopleView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'activeFrameModel'
  }),

  events : {
    "click .js-roll-item-button"          : "goToRoll"
  },

  tagName : 'li',

  className : 'roll-item clearfix',

  template : function(obj){
    return JST['roll-item-people'](obj);
  },

  render : function(){
    this.$el.html(this.template({roll : this.model}));
    libs.shelbyGT.ActiveHighlightListItemView.prototype.render.call(this);
  },

  goToRoll : function(){
    shelby.router.navigateToRoll(this.model, {trigger:true});
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
