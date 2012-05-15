libs.shelbyGT.RollItemView = ListItemView.extend({

  events : {
    "click .js-roll-item-button" : "goToRoll"
  },

  tagName : 'li',

  className : 'roll-item clearfix',

  template : function(obj){
    return JST['roll-item'](obj);
  },

  initialize : function(){
    this.render();
    /*this.model.bind('change', this.render, this);
    this.model.bind('destroy', this.remove, this);*/
  },

  _cleanup : function(){
    /*this.model.unbind('change', this.render, this);
    this.model.unbind('destroy', this.remove, this);*/
  },

  render : function(){
    this.$el.html(this.template({roll : this.model}));
    var activeFrameModel = shelby.models.guide.get('activeFrameModel');
    if (activeFrameModel) {
      var roll = activeFrameModel.get('roll');
      if (roll && this.model.id == roll.id) {
        this.$el.addClass('active-list-item');
      }
    }
  },

  goToRoll : function(){
    shelby.router.navigateToRoll(this.model, {trigger:true});
  }

});
