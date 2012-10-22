libs.shelbyGT.RollHeaderView = Support.CompositeView.extend({

  className : 'roll-header clearfix',

  template : function(obj){
    return SHELBYJST['roll-header'](obj);
  },

  initialize : function(){
    this.model.bind('change', this.render, this);
  },

  _cleanup : function(){
    this.model.unbind('change', this.render, this);
  },

  render : function(){
    if (this.model.has('roll_type')) {
      this.$el.html(this.template({roll:this.model,guide:shelby.models.guide}));
    }
    shelby.models.guide.trigger('reposition');
  }

});
