RollView = ListView.extend({

  /*options : {
    collectionAttribute : 'frames'
  },*/

  initialize : function(){
    this.options.collectionAttribute = 'frames';
    this.options.listItemView = FrameView;
    ListView.prototype.initialize.call(this);
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
