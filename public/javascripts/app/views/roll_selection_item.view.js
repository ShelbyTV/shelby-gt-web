libs.shelbyGT.RollSelectionItemView = ListItemView.extend({

  events : {
    "click" : "_reRollToThis"
  },

  tagName : 'li',

  className : 'roll-selection-item clearfix',

  template : function(obj){
    return JST['roll-selection-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({roll : this.model}));
  },

  _reRollToThis : function(){
    var self = this;
    this.options.frame.reRoll(this.model, function(newFrame){
      self.parent.parent.revealFrameRollingCompletionView(newFrame, self.options.frame, self.model);
    });
  }

});