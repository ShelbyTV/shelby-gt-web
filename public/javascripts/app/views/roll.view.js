RollView = Backbone.View.extend({

  initialize : function(){
    this.model.get('frames').bind('add', this.addOne, this);
    this.model.get('frames').bind('reset', this.addAll, this);
    //this.model.get('frames').bind('all', this.render, this);
  },

  // render : function(){
  // },

  addOne : function(frame){
    console.log('Add one',this);
    var frameView = new FrameView({model: frame});
    frameView.render();
	$(this.el).append(frameView.el);
  },

  addAll: function(frames) {
	console.log('Add all',arguments);
	$(this.el).html('');
	//frames.each(this.addOne);
  }

});
