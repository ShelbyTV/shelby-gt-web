/*
 * Displays an invidividual selectable discussion roll so you can get to your other chats.
 *
 */
libs.shelbyGT.DiscussionRollsNavRollView = Support.CompositeView.extend({
  
  //no el b/c we are rendered by DiscussionRollsManagerView via appendChildInto
  tagName: 'li',

  className: 'discussion__item discussion__item--discussion-roll',

  initialize : function(){
  },
  
  template : function(obj){
    return SHELBYJST['discussion-roll/roll'](obj);
  },
  
  render : function(){
    this.$el.html(this.template({roll:this.model, viewer:this.options.viewer}));
  }
  
});