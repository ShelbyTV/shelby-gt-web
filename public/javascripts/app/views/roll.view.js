RollView = Backbone.View.extend({

  initialize : function(){
    this.model.get('frames').bind('add', this.addOne, this);
    this.model.get('frames').bind('reset', this.addAll, this);
    this.model.get('frames').bind('all', this.render, this);
    
    this.model.fetch(); //fetch (or re-fetch already fetched)
  },

  render : function(){
  },

  addOne : function(frame){
    var frameView = new FrameView({model: frame});
    $(this.el).append(frameView.render().el);
  },

  addAll: function(frames) {
    frames.each(this.addOne);
  }

});
