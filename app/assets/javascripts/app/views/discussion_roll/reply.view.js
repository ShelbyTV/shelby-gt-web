/*
 * Gives the user the ability to reply to this discussion roll.
 * Since it's just a regular Roll with the most recent message shown at the bottom,
 * the user just replies to the most recent Frame (displayed via the DiscussionRollConversationView)
 * and only that Frame (ie not showing reply to conversation for older Frames)
 */
libs.shelbyGT.DiscussionRollReplyView = Support.CompositeView.extend({
  
  el: '.js-discussion-roll-reply',
  
  initialize : function(){
    this.render();
  },
  
  template : function(obj){
    return SHELBYJST['discussion-roll/reply'](obj);
  },
  
  render : function(){
    this.$el.html(this.template());
  }
  
});
  
  