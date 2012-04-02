libs.shelbyGT.RollFilterControlsView = Support.CompositeView.extend({

  events : {
    "click .js-back" : "_goBackToRollsList",
    "click .js-next" : "_goToNextRoll"
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
    this.$el.html(this.template({roll:this.model}));
  },

  _goBackToRollsList : function(){
    shelby.router.navigate("rolls", {trigger:true});
  },

  _goToNextRoll : function(){
    var nextRoll = shelby.models.user.getNextRoll(this.model);
    shelby.router.navigateToRoll(nextRoll, {trigger:true,replace:true});
  }

});