/*
 * Displays the invidividuals (shelby users or not) whom this discussion roll is with.
 * Does not display the viewing user b/c it's shown as a TO: field.
 */
libs.shelbyGT.DiscussionRollRecipientsView = Support.CompositeView.extend({

  el: '.js-discussion-roll-recipients',
  
  initialize : function(){
    this.render();
  },
  
  template : function(obj){
    return SHELBYJST['discussion-roll/recipients'](obj);
  },
  
  render : function(){
    this.$el.html(this.template());
  }
  
});