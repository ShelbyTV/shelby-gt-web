libs.shelbyGT.ExploreFrameItemView = libs.shelbyGT.ListItemView.extend({

  events : {
    'click .js-explore-frame-thumbnail' : '_displayVideo'
  },

  className : 'explore-roll-item',

  template : function(obj){
    return JST['explore-frame-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({frame : this.model}));
    return this;
  },

  _displayVideo : function() {
    shelby.router.navigate('roll/' + this.options.roll.id + '/frame/' + this.model.id, {trigger:true});
  }

});