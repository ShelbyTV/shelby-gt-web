libs.shelbyGT.RollFilterControlsView = Support.CompositeView.extend({

  events : {
    "click .next" : "_goToNextRoll"
  },

  tagName : 'ul',

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

  _goToNextRoll : function(){
    var nextRoll = shelby.models.user.getNextRoll(this.model);
    shelby.router.navigateToRoll(nextRoll, {trigger:true,replace:true});
  }

});