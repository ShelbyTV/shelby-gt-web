RollView = Support.CompositeView.extend({

  initialize : function(){
    this.model.bind('add:frames', this.addOne, this);
    //this.model.get('frames').bind('all', this.render, this);
  },

  // render : function(){
  // },

  addOne : function(frame){
    console.log('myles');
    var frameView = new FrameView({model: frame});
    frameView.render();
	this.$el.append(frameView.el);
  },

  _cleanup : function() {
    this.model.unbind('add:frames', this.addOne, this);
  }

});
