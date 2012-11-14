/*
 * Displays an individual frame in a discusison roll
 * Important that this display the entire conversation, newest message at top.
 */
libs.shelbyGT.DiscussionRollFrameView = libs.shelbyGT.ListItemView.extend({
  
  className : "discussion-roll-frame js-discussion-roll-frame",
  
  initialize : function(){
    this.model.get('conversation').on('change', this.render, this);
  },
  
  _cleanup : function(){
    this.model.off('change', this.render);
  },

  template : function(obj){
    return SHELBYJST['discussion-roll/frame'](obj);
  },
  
  render : function(){
    this.$el.html(this.template({frame: this.model, viewer: this.options.viewer}));

    libs.shelbyGT.ListItemView.prototype.render.call(this);
  }
  
});