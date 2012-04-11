libs.shelbyGT.RollFilterControlsView = Support.CompositeView.extend({

  events : {
    "click #js-roll-back" : "_goToPreviousRoll",
    "click #js-roll-next" : "_goToNextRoll"
  },

  tagName : 'div',

  className : 'filter clearfix',

  template : function(obj){
    return JST['roll-filter-controls'](obj);
  },

  initialize : function(){
    this.model.bind('change:title', this.render, this);
  },

  _cleanup : function(){
    this.model.unbind('change:title', this.render, this);
  },

  render : function(){
    this.$el.html(this.template({roll:this.model,guide:shelby.models.guide}));
  },

  _goBackToRollsList : function(){
    shelby.router.navigate("rolls", {trigger:true});
  },

  _goToPreviousRoll : function(){
    var previousRoll = shelby.models.user.getPreviousRoll(this.model);
    shelby.router.navigateToRoll(previousRoll, {trigger:true,replace:true});
  },

  _goToNextRoll : function(){
    var nextRoll = shelby.models.user.getNextRoll(this.model);
    shelby.router.navigateToRoll(nextRoll, {trigger:true,replace:true});
  }

});